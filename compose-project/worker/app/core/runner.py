"""Parser runner/orchestrator for coordinating parsing operations.

This module coordinates parsing operations across multiple adapters,
with comprehensive progress tracking written to the database.
"""
import asyncio
from datetime import datetime, timedelta
from typing import Callable, Dict, List, Optional, Type
from uuid import UUID
import structlog
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from .base_adapter import BaseAdapter, JobData, ParseResult
from .config import ParserConfig
from .utils import compute_content_hash

logger = structlog.get_logger()


class ParserRunner:
    """Orchestrates parsing operations across multiple adapters with progress tracking."""

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
        self._current_parse_job_id: Optional[UUID] = None

    async def ensure_tables_exist(self):
        """Ensure parse_jobs and parse_job_items tables exist."""
        from app.models.parse_job import ParseJob, ParseJobItem
        from app.models.base import Base

        async with self._engine.begin() as conn:
            # Create tables if they don't exist
            await conn.run_sync(Base.metadata.create_all)
        logger.info("database_tables_ensured")

    async def run_all(
        self,
        regions: Optional[List[str]] = None,
        job_type: str = "scheduled",
        triggered_by: str = "system",
    ) -> Dict[str, ParseResult]:
        """Run all enabled parsers with progress tracking.

        Args:
            regions: Optional list of regions to parse
            job_type: Type of job (scheduled, manual, single, retry)
            triggered_by: Who triggered this job (system, admin, api)

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
                result = await self.run_source(
                    source_name,
                    regions,
                    job_type=job_type,
                    triggered_by=triggered_by,
                )
                results[source_name] = result
            except Exception as e:
                logger.error("parser_failed", source=source_name, error=str(e))
                results[source_name] = ParseResult(errors=[str(e)])

        return results

    async def run_source(
        self,
        source_name: str,
        regions: Optional[List[str]] = None,
        job_type: str = "manual",
        triggered_by: str = "system",
        categories: Optional[List[int]] = None,
    ) -> ParseResult:
        """Run a single parser source with progress tracking.

        Jobs are inserted to database immediately after parsing,
        not batched at the end. Progress is tracked in parse_jobs table.

        Args:
            source_name: Source identifier (e.g., "jobs.ge")
            regions: Optional list of regions
            job_type: Type of job (scheduled, manual, single, retry)
            triggered_by: Who triggered this job
            categories: Optional list of category IDs to parse

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
            job_type=job_type,
        )

        # Create parse job record
        parse_job_id = await self._create_parse_job(
            source_name=source_name,
            job_type=job_type,
            triggered_by=triggered_by,
            config={"regions": regions, "categories": categories},
        )
        self._current_parse_job_id = parse_job_id

        combined_result = ParseResult()
        stats = {"new": 0, "updated": 0, "skipped": 0}

        # Create persistent session for instant insertion
        async with self._session_maker() as session:
            # Load category cache
            if not self._category_cache:
                await self._load_categories(session)

            # Mark job as running
            await self._update_parse_job(
                parse_job_id,
                status="running",
                started_at=datetime.utcnow(),
            )

            # Create callback for instant job insertion with progress tracking
            async def on_job_parsed(job: JobData) -> str:
                """Insert job immediately after parsing and update progress."""
                try:
                    result = await self._upsert_job(session, job, source_name)
                    stats[result] += 1
                    await session.commit()

                    # Update progress
                    await self._update_parse_job_progress(
                        parse_job_id,
                        processed=stats["new"] + stats["updated"] + stats["skipped"],
                        new=stats["new"],
                        updated=stats["updated"],
                        skipped=stats["skipped"],
                    )

                    # Log progress every 10 jobs
                    total = stats["new"] + stats["updated"] + stats["skipped"]
                    if total % 10 == 0:
                        logger.info(
                            "parse_progress",
                            job_id=str(parse_job_id),
                            total=total,
                            new=stats["new"],
                            updated=stats["updated"],
                        )
                    return result
                except Exception as e:
                    logger.warning(
                        "job_insert_failed",
                        external_id=job.external_id,
                        error=str(e),
                    )
                    await session.rollback()
                    stats["skipped"] += 1
                    return "skipped"

            try:
                # Run parser with instant insertion callback
                regions_to_parse = regions if regions else [None]
                for region in regions_to_parse:
                    # Update current region
                    await self._update_parse_job(
                        parse_job_id,
                        current_region=region,
                    )

                    adapter = adapter_class()
                    result = await adapter.run(region, on_job_parsed=on_job_parsed)
                    combined_result.errors.extend(result.errors)
                    combined_result.pages_parsed += result.pages_parsed

                combined_result.total_found = stats["new"] + stats["updated"] + stats["skipped"]

                # Mark job as complete
                await self._update_parse_job(
                    parse_job_id,
                    status="completed",
                    completed_at=datetime.utcnow(),
                    total_items=combined_result.total_found,
                    processed_items=combined_result.total_found,
                    successful_items=stats["new"] + stats["updated"],
                    failed_items=0,
                    skipped_items=stats["skipped"],
                    new_items=stats["new"],
                    updated_items=stats["updated"],
                    errors=combined_result.errors if combined_result.errors else None,
                    current_region=None,
                    current_category=None,
                )

                logger.info(
                    "parser_run_completed",
                    job_id=str(parse_job_id),
                    source=source_name,
                    total_found=combined_result.total_found,
                    new_jobs=stats["new"],
                    updated_jobs=stats["updated"],
                    skipped=stats["skipped"],
                    errors=len(combined_result.errors),
                )

            except Exception as e:
                # Mark job as failed
                await self._update_parse_job(
                    parse_job_id,
                    status="failed",
                    completed_at=datetime.utcnow(),
                    error_message=str(e),
                )
                raise

        self._current_parse_job_id = None
        return combined_result

    async def parse_single_job(
        self,
        source_name: str,
        external_id: str,
        triggered_by: str = "admin",
    ) -> Optional[Dict]:
        """Parse a single job by its external ID.

        Args:
            source_name: Source identifier (e.g., "jobs.ge")
            external_id: External job ID (e.g., jobs.ge ID)
            triggered_by: Who triggered this parse

        Returns:
            Dict with job info and result, or None if failed
        """
        if source_name not in self.adapters:
            raise ValueError(f"Unknown source: {source_name}")

        # Create parse job record
        parse_job_id = await self._create_parse_job(
            source_name=source_name,
            job_type="single",
            triggered_by=triggered_by,
            config={"external_id": external_id},
        )

        adapter_class = self.adapters[source_name]

        try:
            await self._update_parse_job(
                parse_job_id,
                status="running",
                started_at=datetime.utcnow(),
                total_items=1,
            )

            # Build URL from external ID
            if source_name == "jobs.ge":
                url = f"https://jobs.ge/ge/?view=jobs&id={external_id}"
            else:
                raise ValueError(f"Single job parse not supported for {source_name}")

            # Parse the job
            adapter = adapter_class()

            async with self._session_maker() as session:
                if not self._category_cache:
                    await self._load_categories(session)

                # Use legacy interface for single job
                from app.core.http_client import HTTPClient
                async with HTTPClient(
                    rate_limit_delay=adapter.rate_limit_delay,
                    headers={"User-Agent": adapter.user_agent}
                ) as client:
                    adapter.client = client
                    from app.parsers.jobsge_config import get_region_by_lid, get_category_by_cid
                    region = get_region_by_lid(14)  # Default region
                    category = get_category_by_cid(9)  # Default category
                    job_data = await adapter._parse_job_detail(url, region, category)

                if job_data:
                    # Insert the job
                    result = await self._upsert_job(session, job_data, source_name)
                    await session.commit()

                    await self._update_parse_job(
                        parse_job_id,
                        status="completed",
                        completed_at=datetime.utcnow(),
                        processed_items=1,
                        successful_items=1,
                        new_items=1 if result == "new" else 0,
                        updated_items=1 if result == "updated" else 0,
                        skipped_items=1 if result == "skipped" else 0,
                    )

                    return {
                        "job_id": str(parse_job_id),
                        "external_id": external_id,
                        "result": result,
                        "title": job_data.title_ge,
                        "company": job_data.company_name,
                        "url": url,
                    }
                else:
                    await self._update_parse_job(
                        parse_job_id,
                        status="failed",
                        completed_at=datetime.utcnow(),
                        error_message="Failed to parse job - no data returned",
                    )
                    return None

        except Exception as e:
            await self._update_parse_job(
                parse_job_id,
                status="failed",
                completed_at=datetime.utcnow(),
                error_message=str(e),
            )
            logger.error("single_job_parse_failed", external_id=external_id, error=str(e))
            raise

    async def _create_parse_job(
        self,
        source_name: str,
        job_type: str,
        triggered_by: str,
        config: Optional[dict] = None,
    ) -> UUID:
        """Create a new parse job record."""
        from app.models.parse_job import ParseJob

        async with self._session_maker() as session:
            job = ParseJob(
                job_type=job_type,
                source=source_name,
                status="pending",
                config=config,
                triggered_by=triggered_by,
            )
            session.add(job)
            await session.commit()
            await session.refresh(job)
            logger.info("parse_job_created", job_id=str(job.id), job_type=job_type)
            return job.id

    async def _update_parse_job(self, job_id: UUID, **kwargs):
        """Update a parse job record."""
        from app.models.parse_job import ParseJob

        async with self._session_maker() as session:
            stmt = (
                update(ParseJob)
                .where(ParseJob.id == job_id)
                .values(**kwargs)
            )
            await session.execute(stmt)
            await session.commit()

    async def _update_parse_job_progress(
        self,
        job_id: UUID,
        processed: int,
        new: int,
        updated: int,
        skipped: int,
    ):
        """Update parse job progress counters."""
        from app.models.parse_job import ParseJob

        async with self._session_maker() as session:
            stmt = (
                update(ParseJob)
                .where(ParseJob.id == job_id)
                .values(
                    processed_items=processed,
                    successful_items=new + updated,
                    new_items=new,
                    updated_items=updated,
                    skipped_items=skipped,
                )
            )
            await session.execute(stmt)
            await session.commit()

    async def get_current_job_progress(self) -> Optional[dict]:
        """Get progress of currently running parse job."""
        if not self._current_parse_job_id:
            return None

        from app.models.parse_job import ParseJob

        async with self._session_maker() as session:
            result = await session.execute(
                select(ParseJob).where(ParseJob.id == self._current_parse_job_id)
            )
            job = result.scalar_one_or_none()
            if job:
                return job.to_dict()
        return None

    async def _load_categories(self, session: AsyncSession):
        """Load category slug to ID mapping into cache."""
        from app.models.category import Category

        result = await session.execute(select(Category))
        categories = result.scalars().all()

        for cat in categories:
            self._category_cache[cat.slug] = cat.id
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

        content_hash = compute_content_hash(
            job.title_ge,
            job.body_ge,
            job.company_name,
        )

        query = select(Job).where(
            Job.parsed_from == source_name,
            Job.external_id == job.external_id,
        )
        result = await session.execute(query)
        existing = result.scalar_one_or_none()

        now = datetime.utcnow()

        if existing:
            if existing.content_hash == content_hash:
                existing.last_seen_at = now
                if job.location:
                    existing.location = job.location
                if job.jobsge_cid is not None:
                    existing.jobsge_cid = job.jobsge_cid
                if job.jobsge_lid is not None:
                    existing.jobsge_lid = job.jobsge_lid
                return "skipped"
            else:
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
                if job.jobsge_cid is not None:
                    existing.jobsge_cid = job.jobsge_cid
                if job.jobsge_lid is not None:
                    existing.jobsge_lid = job.jobsge_lid
                return "updated"
        else:
            category_id = self._get_category_id(job.category_slug)
            if not category_id:
                logger.warning(
                    "no_category_available",
                    external_id=job.external_id,
                    category_slug=job.category_slug,
                )
                return "skipped"

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
                jobsge_cid=job.jobsge_cid,
                jobsge_lid=job.jobsge_lid,
            )

            session.add(new_job)

            logger.info(
                "job_inserted",
                external_id=job.external_id,
                title=job.title_ge[:50] if job.title_ge else "",
                category=job.category_slug,
                cid=job.jobsge_cid,
                lid=job.jobsge_lid,
            )
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
                    Job.parsed_from != "manual",
                )
                .values(status="inactive")
            )
            result = await session.execute(stmt)
            await session.commit()

            count = result.rowcount
            logger.info("jobs_deactivated", count=count, cutoff=cutoff.isoformat())
            return count

    # Legacy methods kept for compatibility
    async def _start_run(self, source_name: str) -> UUID:
        """Record start of a parser run (legacy)."""
        from uuid import uuid4
        return uuid4()

    async def _complete_run(self, run_id: UUID, result: ParseResult, stats: Dict[str, int]):
        """Record completion of a parser run (legacy)."""
        pass

    async def _fail_run(self, run_id: UUID, error: str):
        """Record failure of a parser run (legacy)."""
        pass
