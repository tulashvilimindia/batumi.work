"""Parser runner/orchestrator for coordinating parsing operations."""
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Type
from uuid import UUID
import structlog
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from .base_adapter import BaseAdapter, JobData, ParseResult
from .config import ParserConfig
from .utils import compute_content_hash

logger = structlog.get_logger()


class ParserRunner:
    """Orchestrates parsing operations across multiple adapters."""

    def __init__(
        self,
        config: ParserConfig,
        adapters: Dict[str, Type[BaseAdapter]],
    ):
        """Initialize parser runner.

        Args:
            config: Parser configuration
            adapters: Dict mapping source names to adapter classes
        """
        self.config = config
        self.adapters = adapters
        self._engine = create_async_engine(config.database_url, echo=config.debug)
        self._session_maker = async_sessionmaker(self._engine, expire_on_commit=False)
        self._category_cache: Dict[str, UUID] = {}
        self._default_category_id: Optional[UUID] = None

    async def run_all(self, regions: Optional[List[str]] = None) -> Dict[str, ParseResult]:
        """Run all enabled parsers.

        Args:
            regions: Optional list of regions to parse

        Returns:
            Dict mapping source names to ParseResults
        """
        results = {}
        regions = regions or self.config.regions

        for source_name in self.config.enabled_sources:
            if source_name not in self.adapters:
                logger.warning("adapter_not_found", source=source_name)
                continue

            try:
                result = await self.run_source(source_name, regions)
                results[source_name] = result
            except Exception as e:
                logger.error("parser_failed", source=source_name, error=str(e))
                results[source_name] = ParseResult(errors=[str(e)])

        return results

    async def run_source(
        self,
        source_name: str,
        regions: Optional[List[str]] = None,
    ) -> ParseResult:
        """Run a single parser source.

        Args:
            source_name: Source identifier (e.g., "jobs.ge")
            regions: Optional list of regions

        Returns:
            ParseResult with parsed jobs and statistics
        """
        if source_name not in self.adapters:
            raise ValueError(f"Unknown source: {source_name}")

        adapter_class = self.adapters[source_name]
        regions = regions or self.config.regions

        logger.info(
            "parser_run_started",
            source=source_name,
            regions=regions,
        )

        run_id = await self._start_run(source_name)
        combined_result = ParseResult()

        try:
            # If regions is empty, run once with no filter (all jobs)
            regions_to_parse = regions if regions else [None]
            for region in regions_to_parse:
                adapter = adapter_class()
                result = await adapter.run(region)
                combined_result.jobs.extend(result.jobs)
                combined_result.errors.extend(result.errors)
                combined_result.total_found += result.total_found
                combined_result.pages_parsed += result.pages_parsed

            # Process and store jobs
            stats = await self._process_jobs(combined_result.jobs, source_name)

            # Mark run as complete
            await self._complete_run(run_id, combined_result, stats)

            logger.info(
                "parser_run_completed",
                source=source_name,
                total_found=combined_result.total_found,
                new_jobs=stats.get("new", 0),
                updated_jobs=stats.get("updated", 0),
                errors=len(combined_result.errors),
            )

        except Exception as e:
            await self._fail_run(run_id, str(e))
            raise

        return combined_result

    async def _process_jobs(
        self,
        jobs: List[JobData],
        source_name: str,
    ) -> Dict[str, int]:
        """Process parsed jobs and upsert to database.

        Args:
            jobs: List of parsed job data
            source_name: Source identifier

        Returns:
            Stats dict with new/updated/skipped counts
        """
        stats = {"new": 0, "updated": 0, "skipped": 0}

        async with self._session_maker() as session:
            # Load category cache if empty
            if not self._category_cache:
                await self._load_categories(session)

            for job in jobs:
                try:
                    result = await self._upsert_job(session, job, source_name)
                    stats[result] += 1
                    # Flush after each successful insert to catch errors early
                    await session.flush()
                except Exception as e:
                    logger.warning(
                        "job_upsert_failed",
                        external_id=job.external_id,
                        error=str(e),
                    )
                    stats["skipped"] += 1
                    # Rollback and start fresh for next job
                    await session.rollback()
                    # Reload categories after rollback
                    if not self._category_cache:
                        await self._load_categories(session)

            await session.commit()

        return stats

    async def _load_categories(self, session: AsyncSession):
        """Load category slug to ID mapping into cache."""
        from app.models.category import Category

        result = await session.execute(select(Category))
        categories = result.scalars().all()

        for cat in categories:
            self._category_cache[cat.slug] = cat.id
            # Use 'other' or first category as default
            if cat.slug == "other" or self._default_category_id is None:
                self._default_category_id = cat.id

        logger.info("categories_loaded", count=len(self._category_cache))

    def _get_category_id(self, slug: Optional[str]) -> UUID:
        """Get category ID from slug, falling back to default."""
        if slug and slug in self._category_cache:
            return self._category_cache[slug]
        return self._default_category_id

    async def _upsert_job(
        self,
        session: AsyncSession,
        job: JobData,
        source_name: str,
    ) -> str:
        """Upsert a single job to database.

        Uses (parsed_from, external_id) as unique key.
        If content changed, updates the record.

        Args:
            session: Database session
            job: Job data to upsert
            source_name: Source identifier

        Returns:
            "new", "updated", or "skipped"
        """
        from app.models.job import Job

        # Compute content hash
        content_hash = compute_content_hash(
            job.title_ge,
            job.body_ge,
            job.company_name,
        )

        # Look for existing job
        query = select(Job).where(
            Job.parsed_from == source_name,
            Job.external_id == job.external_id,
        )
        result = await session.execute(query)
        existing = result.scalar_one_or_none()

        now = datetime.utcnow()

        if existing:
            # Check if content changed
            if existing.content_hash == content_hash:
                # Just update last_seen_at and location (if provided)
                existing.last_seen_at = now
                # Always update location if job has one from parser
                if job.location:
                    existing.location = job.location
                # Always update jobsge filter values if provided (backfill)
                if job.jobsge_cid is not None:
                    existing.jobsge_cid = job.jobsge_cid
                if job.jobsge_lid is not None:
                    existing.jobsge_lid = job.jobsge_lid
                return "skipped"
            else:
                # Update job with new content
                existing.title_ge = job.title_ge
                existing.title_en = job.title_en
                existing.body_ge = job.body_ge
                existing.body_en = job.body_en
                existing.company_name = job.company_name
                existing.location = job.location
                existing.has_salary = job.has_salary
                existing.salary_min = job.salary_min
                existing.salary_max = job.salary_max
                existing.salary_currency = job.salary_currency
                existing.published_at = job.published_at
                existing.deadline_at = job.deadline_at
                existing.is_vip = job.is_vip
                existing.content_hash = content_hash
                existing.last_seen_at = now
                existing.status = "active"
                # Update jobsge filter values
                if job.jobsge_cid is not None:
                    existing.jobsge_cid = job.jobsge_cid
                if job.jobsge_lid is not None:
                    existing.jobsge_lid = job.jobsge_lid
                return "updated"
        else:
            # Get category ID (required field)
            category_id = self._get_category_id(job.category_slug)
            if not category_id:
                logger.warning(
                    "no_category_available",
                    external_id=job.external_id,
                    category_slug=job.category_slug,
                )
                return "skipped"

            # Create new job
            new_job = Job(
                title_ge=job.title_ge,
                title_en=job.title_en,
                body_ge=job.body_ge,
                body_en=job.body_en,
                company_name=job.company_name,
                location=job.location,
                remote_type=job.remote_type,
                employment_type=job.employment_type,
                has_salary=job.has_salary,
                salary_min=job.salary_min,
                salary_max=job.salary_max,
                salary_currency=job.salary_currency,
                salary_period=job.salary_period,
                published_at=job.published_at,
                deadline_at=job.deadline_at,
                is_vip=job.is_vip,
                is_featured=job.is_featured,
                parsed_from=source_name,
                external_id=job.external_id,
                source_url=job.source_url,
                content_hash=content_hash,
                category_id=category_id,
                status="active",
                first_seen_at=now,
                last_seen_at=now,
                # jobs.ge original filter values
                jobsge_cid=job.jobsge_cid,
                jobsge_lid=job.jobsge_lid,
            )

            session.add(new_job)
            return "new"

    async def deactivate_not_seen(self) -> int:
        """Deactivate jobs not seen within configured days.

        Returns:
            Number of jobs deactivated
        """
        cutoff = datetime.utcnow() - timedelta(days=self.config.not_seen_days_to_inactive)

        async with self._session_maker() as session:
            from app.models.job import Job

            stmt = (
                update(Job)
                .where(
                    Job.status == "active",
                    Job.last_seen_at < cutoff,
                    Job.parsed_from != "manual",  # Don't deactivate manual jobs
                )
                .values(status="inactive")
            )
            result = await session.execute(stmt)
            await session.commit()

            count = result.rowcount
            logger.info("jobs_deactivated", count=count, cutoff=cutoff.isoformat())
            return count

    async def _start_run(self, source_name: str) -> UUID:
        """Record start of a parser run.

        Args:
            source_name: Source identifier

        Returns:
            Run ID
        """
        # TODO: Implement parser_runs table and storage
        # For now, just generate a UUID
        from uuid import uuid4
        return uuid4()

    async def _complete_run(
        self,
        run_id: UUID,
        result: ParseResult,
        stats: Dict[str, int],
    ):
        """Record completion of a parser run.

        Args:
            run_id: Run ID
            result: Parse result
            stats: Job processing stats
        """
        # TODO: Update parser_runs table
        pass

    async def _fail_run(self, run_id: UUID, error: str):
        """Record failure of a parser run.

        Args:
            run_id: Run ID
            error: Error message
        """
        # TODO: Update parser_runs table
        pass
