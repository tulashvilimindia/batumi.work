"""Parser runner/orchestrator with comprehensive job management.

This module coordinates parsing operations across multiple adapters,
with full progress tracking, job controls (pause/stop/restart),
detailed logging, and multi-job orchestration.
"""
import asyncio
import time
from datetime import datetime, timezone
from typing import Callable, Dict, List, Optional, Type
from uuid import UUID
import structlog
from sqlalchemy import select, update, and_
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from .base_adapter import BaseAdapter, JobData, ParseResult
from .config import ParserConfig
from .utils import compute_content_hash

logger = structlog.get_logger()


class ParseJobLogger:
    """Helper class for logging to parse_job_logs table."""

    def __init__(self, session_maker, job_id: UUID):
        self._session_maker = session_maker
        self.job_id = job_id
        self.current_region: Optional[str] = None
        self.current_category: Optional[str] = None

    async def log(
        self,
        level: str,
        message: str,
        details: Optional[dict] = None,
        external_id: Optional[str] = None,
        region: Optional[str] = None,
        category: Optional[str] = None,
    ):
        """Write a log entry to the database."""
        from app.models.parse_job import ParseJobLog

        async with self._session_maker() as session:
            log_entry = ParseJobLog(
                job_id=self.job_id,
                level=level,
                message=message,
                details=details,
                external_id=external_id,
                region=region or self.current_region,
                category=category or self.current_category,
            )
            session.add(log_entry)
            await session.commit()

    async def debug(self, message: str, **kwargs):
        await self.log("debug", message, **kwargs)

    async def info(self, message: str, **kwargs):
        await self.log("info", message, **kwargs)

    async def warning(self, message: str, **kwargs):
        await self.log("warning", message, **kwargs)

    async def error(self, message: str, **kwargs):
        await self.log("error", message, **kwargs)


class ParserRunner:
    """Orchestrates parsing operations with full job management."""

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
        self._active_jobs: Dict[UUID, dict] = {}  # Track active jobs for control

    async def ensure_tables_exist(self):
        """Ensure all parse tracking tables exist."""
        from app.models.parse_job import ParseJob, ParseJobItem, ParseJobLog, ParseBatch
        from app.models.base import Base

        async with self._engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("database_tables_ensured")

    # =========================================================================
    # JOB CONTROL METHODS
    # =========================================================================

    async def pause_job(self, job_id: UUID) -> bool:
        """Signal a job to pause."""
        from app.models.parse_job import ParseJob

        async with self._session_maker() as session:
            result = await session.execute(
                select(ParseJob).where(ParseJob.id == job_id)
            )
            job = result.scalar_one_or_none()

            if not job or job.status != "running":
                return False

            job.should_pause = True
            await session.commit()
            logger.info("job_pause_signaled", job_id=str(job_id))
            return True

    async def resume_job(self, job_id: UUID) -> bool:
        """Resume a paused job."""
        from app.models.parse_job import ParseJob

        async with self._session_maker() as session:
            result = await session.execute(
                select(ParseJob).where(ParseJob.id == job_id)
            )
            job = result.scalar_one_or_none()

            if not job or job.status != "paused":
                return False

            # Calculate pause duration
            if job.paused_at:
                pause_duration = (datetime.now(timezone.utc) - job.paused_at).total_seconds()
                job.pause_duration_seconds = (job.pause_duration_seconds or 0) + int(pause_duration)

            job.status = "running"
            job.should_pause = False
            job.resumed_at = datetime.now(timezone.utc)
            job.paused_at = None
            await session.commit()
            logger.info("job_resumed", job_id=str(job_id))
            return True

    async def stop_job(self, job_id: UUID) -> bool:
        """Signal a job to stop gracefully."""
        from app.models.parse_job import ParseJob

        async with self._session_maker() as session:
            result = await session.execute(
                select(ParseJob).where(ParseJob.id == job_id)
            )
            job = result.scalar_one_or_none()

            if not job or job.status not in ("running", "paused"):
                return False

            job.should_stop = True
            job.status = "stopping"
            await session.commit()
            logger.info("job_stop_signaled", job_id=str(job_id))
            return True

    async def cancel_job(self, job_id: UUID) -> bool:
        """Cancel a pending or running job immediately."""
        from app.models.parse_job import ParseJob

        async with self._session_maker() as session:
            result = await session.execute(
                select(ParseJob).where(ParseJob.id == job_id)
            )
            job = result.scalar_one_or_none()

            if not job or job.status in ("completed", "failed", "cancelled"):
                return False

            job.status = "cancelled"
            job.completed_at = datetime.now(timezone.utc)
            job.should_stop = True
            await session.commit()
            logger.info("job_cancelled", job_id=str(job_id))
            return True

    async def _check_job_controls(self, job_id: UUID) -> str:
        """Check if job should pause or stop. Returns action: 'continue', 'pause', 'stop'."""
        from app.models.parse_job import ParseJob

        async with self._session_maker() as session:
            result = await session.execute(
                select(ParseJob.should_pause, ParseJob.should_stop, ParseJob.status)
                .where(ParseJob.id == job_id)
            )
            row = result.one_or_none()

            if not row:
                return "stop"

            should_pause, should_stop, status = row

            if should_stop or status == "stopping":
                return "stop"
            if should_pause:
                return "pause"
            return "continue"

    async def _handle_pause(self, job_id: UUID, job_logger: ParseJobLogger):
        """Handle pause state - wait until resumed or stopped."""
        from app.models.parse_job import ParseJob

        async with self._session_maker() as session:
            stmt = (
                update(ParseJob)
                .where(ParseJob.id == job_id)
                .values(
                    status="paused",
                    paused_at=datetime.now(timezone.utc),
                    should_pause=False,
                )
            )
            await session.execute(stmt)
            await session.commit()

        await job_logger.info("Job paused")
        logger.info("job_paused", job_id=str(job_id))

        # Wait for resume or stop
        while True:
            await asyncio.sleep(2)
            action = await self._check_job_controls(job_id)

            if action == "stop":
                return "stop"
            if action == "continue":
                # Job was resumed
                async with self._session_maker() as session:
                    result = await session.execute(
                        select(ParseJob.status).where(ParseJob.id == job_id)
                    )
                    status = result.scalar_one_or_none()
                    if status == "running":
                        await job_logger.info("Job resumed")
                        return "continue"

    # =========================================================================
    # MAIN PARSING METHODS
    # =========================================================================

    async def run_all(
        self,
        regions: Optional[List[str]] = None,
        job_type: str = "scheduled",
        triggered_by: str = "system",
    ) -> Dict[str, ParseResult]:
        """Run all enabled parsers."""
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
        target_region: Optional[str] = None,
        target_category: Optional[str] = None,
        batch_id: Optional[UUID] = None,
    ) -> ParseResult:
        """Run a parser source with full progress tracking and job control.

        Args:
            source_name: Source identifier (e.g., "jobs.ge")
            regions: Optional list of regions
            job_type: Type of job
            triggered_by: Who triggered this job
            categories: Optional list of category IDs
            target_region: Single region for this job (for batch jobs)
            target_category: Single category for this job (for batch jobs)
            batch_id: Parent batch ID if part of multi-job run

        Returns:
            ParseResult with statistics
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
            target_region=target_region,
            target_category=target_category,
            batch_id=batch_id,
        )
        self._current_parse_job_id = parse_job_id
        self._active_jobs[parse_job_id] = {"status": "running"}

        # Create job logger
        job_logger = ParseJobLogger(self._session_maker, parse_job_id)

        combined_result = ParseResult()
        stats = {"new": 0, "updated": 0, "skipped": 0, "failed": 0}
        skip_reasons: Dict[str, int] = {}  # Count skip reasons

        async with self._session_maker() as session:
            if not self._category_cache:
                await self._load_categories(session)

            # Mark job as running
            await self._update_parse_job(
                parse_job_id,
                status="running",
                started_at=datetime.now(timezone.utc),
            )

            await job_logger.info(f"Starting parse job for {source_name}", details={
                "regions": regions,
                "categories": categories,
            })

            # Create callback for instant job insertion with full tracking
            async def on_job_parsed(job: JobData, region: str = None, category: str = None, page: int = None) -> str:
                """Insert job and track with detailed item records."""
                nonlocal stats, skip_reasons
                start_time = time.time()

                # Check for pause/stop
                action = await self._check_job_controls(parse_job_id)
                if action == "pause":
                    result = await self._handle_pause(parse_job_id, job_logger)
                    if result == "stop":
                        raise asyncio.CancelledError("Job stopped")
                elif action == "stop":
                    raise asyncio.CancelledError("Job stopped")

                # Create item record
                item_id = await self._create_parse_item(
                    parse_job_id,
                    external_id=job.external_id,
                    url=job.source_url,
                    title=job.title_ge[:200] if job.title_ge else None,
                    region=region or job_logger.current_region,
                    category=category or job_logger.current_category,
                    page=page,
                )

                try:
                    result, skip_reason = await self._upsert_job_with_reason(
                        session, job, source_name
                    )
                    stats[result] += 1

                    if skip_reason:
                        skip_reasons[skip_reason] = skip_reasons.get(skip_reason, 0) + 1

                    await session.commit()

                    # Update item record
                    processing_ms = int((time.time() - start_time) * 1000)
                    await self._update_parse_item(
                        item_id,
                        status="completed" if result != "failed" else "failed",
                        result=result,
                        skip_reason=skip_reason,
                        processing_ms=processing_ms,
                    )

                    # Update job progress
                    await self._update_parse_job_progress(
                        parse_job_id,
                        processed=sum(stats.values()),
                        new=stats["new"],
                        updated=stats["updated"],
                        skipped=stats["skipped"],
                        failed=stats["failed"],
                        current_item=job.title_ge[:100] if job.title_ge else job.external_id,
                    )

                    # Log every 10 jobs
                    total = sum(stats.values())
                    if total % 10 == 0:
                        await job_logger.info(
                            f"Progress: {total} processed ({stats['new']} new, {stats['updated']} updated, {stats['skipped']} skipped)",
                            details={"stats": stats, "skip_reasons": skip_reasons},
                        )
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
                    stats["failed"] += 1

                    await self._update_parse_item(
                        item_id,
                        status="failed",
                        result="failed",
                        error_message=str(e),
                    )

                    await job_logger.error(
                        f"Failed to insert job: {str(e)}",
                        external_id=job.external_id,
                    )

                    return "failed"

            try:
                # Run parser
                regions_to_parse = regions if regions else [None]
                for region in regions_to_parse:
                    # Check for stop
                    action = await self._check_job_controls(parse_job_id)
                    if action == "stop":
                        raise asyncio.CancelledError("Job stopped")
                    elif action == "pause":
                        result = await self._handle_pause(parse_job_id, job_logger)
                        if result == "stop":
                            raise asyncio.CancelledError("Job stopped")

                    # Update current region
                    job_logger.current_region = region
                    await self._update_parse_job(
                        parse_job_id,
                        current_region=region,
                    )

                    await job_logger.info(f"Starting region: {region or 'all'}")

                    adapter = adapter_class()

                    # Wrap the callback to include region context
                    async def region_callback(job: JobData) -> str:
                        return await on_job_parsed(job, region=region)

                    result = await adapter.run(region, on_job_parsed=region_callback)
                    combined_result.errors.extend(result.errors)
                    combined_result.pages_parsed += result.pages_parsed

                    await job_logger.info(
                        f"Completed region: {region or 'all'}",
                        details={"pages": result.pages_parsed, "errors": len(result.errors)},
                    )

                combined_result.total_found = sum(stats.values())

                # Mark job as complete
                await self._update_parse_job(
                    parse_job_id,
                    status="completed",
                    completed_at=datetime.now(timezone.utc),
                    total_items=combined_result.total_found,
                    processed_items=combined_result.total_found,
                    successful_items=stats["new"] + stats["updated"],
                    failed_items=stats["failed"],
                    skipped_items=stats["skipped"],
                    new_items=stats["new"],
                    updated_items=stats["updated"],
                    errors=combined_result.errors if combined_result.errors else None,
                    current_region=None,
                    current_category=None,
                    current_item=None,
                    should_pause=False,
                    should_stop=False,
                )

                await job_logger.info(
                    "Parse job completed",
                    details={
                        "total": combined_result.total_found,
                        "new": stats["new"],
                        "updated": stats["updated"],
                        "skipped": stats["skipped"],
                        "failed": stats["failed"],
                        "skip_reasons": skip_reasons,
                        "errors": len(combined_result.errors),
                    },
                )

                logger.info(
                    "parser_run_completed",
                    job_id=str(parse_job_id),
                    source=source_name,
                    total_found=combined_result.total_found,
                    new_jobs=stats["new"],
                    updated_jobs=stats["updated"],
                    skipped=stats["skipped"],
                    failed=stats["failed"],
                    errors=len(combined_result.errors),
                )

            except asyncio.CancelledError:
                # Job was stopped
                await self._update_parse_job(
                    parse_job_id,
                    status="cancelled",
                    completed_at=datetime.now(timezone.utc),
                    error_message="Job stopped by user",
                )
                await job_logger.warning("Job stopped by user")
                logger.info("job_stopped", job_id=str(parse_job_id))

            except Exception as e:
                await self._update_parse_job(
                    parse_job_id,
                    status="failed",
                    completed_at=datetime.now(timezone.utc),
                    error_message=str(e),
                )
                await job_logger.error(f"Job failed: {str(e)}")
                raise

        self._current_parse_job_id = None
        del self._active_jobs[parse_job_id]
        return combined_result

    async def parse_single_job(
        self,
        source_name: str,
        external_id: str,
        triggered_by: str = "admin",
    ) -> Optional[Dict]:
        """Parse a single job by its external ID."""
        if source_name not in self.adapters:
            raise ValueError(f"Unknown source: {source_name}")

        parse_job_id = await self._create_parse_job(
            source_name=source_name,
            job_type="single",
            triggered_by=triggered_by,
            config={"external_id": external_id},
        )

        job_logger = ParseJobLogger(self._session_maker, parse_job_id)
        adapter_class = self.adapters[source_name]

        try:
            await self._update_parse_job(
                parse_job_id,
                status="running",
                started_at=datetime.now(timezone.utc),
                total_items=1,
            )

            await job_logger.info(f"Parsing single job: {external_id}")

            if source_name == "jobs.ge":
                url = f"https://jobs.ge/ge/?view=jobs&id={external_id}"
            else:
                raise ValueError(f"Single job parse not supported for {source_name}")

            adapter = adapter_class()

            async with self._session_maker() as session:
                if not self._category_cache:
                    await self._load_categories(session)

                from app.core.http_client import HTTPClient
                async with HTTPClient(
                    rate_limit_delay=adapter.rate_limit_delay,
                    headers={"User-Agent": adapter.user_agent}
                ) as client:
                    adapter.client = client
                    from app.parsers.jobsge_config import get_region_by_lid, get_category_by_cid
                    region = get_region_by_lid(14)
                    category = get_category_by_cid(9)
                    job_data = await adapter._parse_job_detail(url, region, category)

                if job_data:
                    result, skip_reason = await self._upsert_job_with_reason(
                        session, job_data, source_name
                    )
                    await session.commit()

                    await self._update_parse_job(
                        parse_job_id,
                        status="completed",
                        completed_at=datetime.now(timezone.utc),
                        processed_items=1,
                        successful_items=1,
                        new_items=1 if result == "new" else 0,
                        updated_items=1 if result == "updated" else 0,
                        skipped_items=1 if result == "skipped" else 0,
                    )

                    await job_logger.info(
                        f"Single job parsed: {result}",
                        external_id=external_id,
                        details={"title": job_data.title_ge, "skip_reason": skip_reason},
                    )

                    return {
                        "job_id": str(parse_job_id),
                        "external_id": external_id,
                        "result": result,
                        "skip_reason": skip_reason,
                        "title": job_data.title_ge,
                        "company": job_data.company_name,
                        "url": url,
                    }
                else:
                    await self._update_parse_job(
                        parse_job_id,
                        status="failed",
                        completed_at=datetime.now(timezone.utc),
                        error_message="Failed to parse job - no data returned",
                    )
                    await job_logger.error("Failed to parse - no data returned")
                    return None

        except Exception as e:
            await self._update_parse_job(
                parse_job_id,
                status="failed",
                completed_at=datetime.now(timezone.utc),
                error_message=str(e),
            )
            await job_logger.error(f"Parse failed: {str(e)}")
            logger.error("single_job_parse_failed", external_id=external_id, error=str(e))
            raise

    # =========================================================================
    # BATCH/MULTI-JOB METHODS
    # =========================================================================

    async def run_batch(
        self,
        source_name: str,
        regions: Optional[List[str]] = None,
        categories: Optional[List[str]] = None,
        mode: str = "sequential",  # "parallel" or "sequential"
        triggered_by: str = "admin",
    ) -> UUID:
        """Create and run a batch of parse jobs.

        Args:
            source_name: Source to parse
            regions: List of regions to parse (creates one job per region if specified)
            categories: List of categories to parse
            mode: "parallel" or "sequential" execution
            triggered_by: Who triggered this batch

        Returns:
            Batch ID
        """
        from app.models.parse_job import ParseBatch

        # Create batch record
        batch_id = await self._create_batch(
            config={"source": source_name, "regions": regions, "categories": categories},
            mode=mode,
            triggered_by=triggered_by,
        )

        # Determine jobs to create
        jobs_to_create = []

        if regions and len(regions) > 1:
            # Create one job per region
            for region in regions:
                jobs_to_create.append({
                    "target_region": region,
                    "regions": [region],
                })
        else:
            # Single job for all regions
            jobs_to_create.append({
                "target_region": None,
                "regions": regions,
            })

        # Update batch with job count
        async with self._session_maker() as session:
            stmt = update(ParseBatch).where(ParseBatch.id == batch_id).values(
                total_jobs=len(jobs_to_create),
                started_at=datetime.now(timezone.utc),
                status="running",
            )
            await session.execute(stmt)
            await session.commit()

        # Run jobs
        if mode == "parallel":
            # Run all jobs in parallel
            tasks = []
            for job_config in jobs_to_create:
                task = asyncio.create_task(
                    self.run_source(
                        source_name,
                        regions=job_config["regions"],
                        job_type="batch",
                        triggered_by=triggered_by,
                        target_region=job_config["target_region"],
                        batch_id=batch_id,
                    )
                )
                tasks.append(task)

            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Update batch completion
            completed = sum(1 for r in results if not isinstance(r, Exception))
            failed = sum(1 for r in results if isinstance(r, Exception))

        else:
            # Run sequentially
            completed = 0
            failed = 0

            for job_config in jobs_to_create:
                try:
                    await self.run_source(
                        source_name,
                        regions=job_config["regions"],
                        job_type="batch",
                        triggered_by=triggered_by,
                        target_region=job_config["target_region"],
                        batch_id=batch_id,
                    )
                    completed += 1
                except Exception as e:
                    failed += 1
                    logger.error("batch_job_failed", error=str(e))

        # Update batch status
        async with self._session_maker() as session:
            stmt = update(ParseBatch).where(ParseBatch.id == batch_id).values(
                status="completed" if failed == 0 else "failed",
                completed_jobs=completed,
                failed_jobs=failed,
                completed_at=datetime.now(timezone.utc),
            )
            await session.execute(stmt)
            await session.commit()

        return batch_id

    async def _create_batch(
        self,
        config: dict,
        mode: str,
        triggered_by: str,
    ) -> UUID:
        """Create a new batch record."""
        from app.models.parse_job import ParseBatch

        async with self._session_maker() as session:
            batch = ParseBatch(
                config=config,
                mode=mode,
                triggered_by=triggered_by,
                status="pending",
            )
            session.add(batch)
            await session.commit()
            await session.refresh(batch)
            logger.info("batch_created", batch_id=str(batch.id))
            return batch.id

    # =========================================================================
    # INTERNAL HELPER METHODS
    # =========================================================================

    async def _create_parse_job(
        self,
        source_name: str,
        job_type: str,
        triggered_by: str,
        config: Optional[dict] = None,
        target_region: Optional[str] = None,
        target_category: Optional[str] = None,
        batch_id: Optional[UUID] = None,
    ) -> UUID:
        """Create a new parse job record."""
        from app.models.parse_job import ParseJob

        async with self._session_maker() as session:
            job = ParseJob(
                job_type=job_type,
                source=source_name,
                status="pending",
                config=config,
                target_region=target_region,
                target_category=target_category,
                batch_id=batch_id,
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
        failed: int = 0,
        current_item: Optional[str] = None,
    ):
        """Update parse job progress counters."""
        from app.models.parse_job import ParseJob

        async with self._session_maker() as session:
            values = {
                "processed_items": processed,
                "successful_items": new + updated,
                "new_items": new,
                "updated_items": updated,
                "skipped_items": skipped,
                "failed_items": failed,
            }
            if current_item:
                values["current_item"] = current_item[:200]

            stmt = (
                update(ParseJob)
                .where(ParseJob.id == job_id)
                .values(**values)
            )
            await session.execute(stmt)
            await session.commit()

    async def _create_parse_item(
        self,
        job_id: UUID,
        external_id: str,
        url: str,
        title: Optional[str] = None,
        region: Optional[str] = None,
        category: Optional[str] = None,
        page: Optional[int] = None,
    ) -> UUID:
        """Create a parse job item record."""
        from app.models.parse_job import ParseJobItem

        async with self._session_maker() as session:
            item = ParseJobItem(
                job_id=job_id,
                external_id=external_id,
                url=url,
                title=title,
                region=region,
                category=category,
                page=page,
                status="parsing",
                started_at=datetime.now(timezone.utc),
            )
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item.id

    async def _update_parse_item(
        self,
        item_id: UUID,
        status: str,
        result: str,
        skip_reason: Optional[str] = None,
        error_message: Optional[str] = None,
        processing_ms: Optional[int] = None,
    ):
        """Update a parse job item record."""
        from app.models.parse_job import ParseJobItem

        async with self._session_maker() as session:
            values = {
                "status": status,
                "result": result,
                "completed_at": datetime.now(timezone.utc),
            }
            if skip_reason:
                values["skip_reason"] = skip_reason
            if error_message:
                values["error_message"] = error_message
            if processing_ms:
                values["processing_ms"] = processing_ms

            stmt = (
                update(ParseJobItem)
                .where(ParseJobItem.id == item_id)
                .values(**values)
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

    async def _upsert_job_with_reason(
        self,
        session: AsyncSession,
        job: JobData,
        source_name: str,
    ) -> tuple:
        """Upsert a job and return (result, skip_reason).

        Returns:
            Tuple of (result: str, skip_reason: Optional[str])
            result is one of: "new", "updated", "skipped", "failed"
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

        now = datetime.now(timezone.utc)

        if existing:
            if existing.content_hash == content_hash:
                # Update last_seen and metadata, but content unchanged
                existing.last_seen_at = now
                if job.location:
                    existing.location = job.location
                if job.jobsge_cid is not None:
                    existing.jobsge_cid = job.jobsge_cid
                if job.jobsge_lid is not None:
                    existing.jobsge_lid = job.jobsge_lid
                return ("skipped", "unchanged_content")
            else:
                # Content changed - update
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
                return ("updated", None)
        else:
            # New job
            category_id = self._get_category_id(job.category_slug)
            if not category_id:
                logger.warning(
                    "no_category_available",
                    external_id=job.external_id,
                    category_slug=job.category_slug,
                )
                return ("skipped", "no_category")

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
            return ("new", None)

    async def deactivate_not_seen(self) -> int:
        """Deactivate jobs not seen within configured days."""
        from datetime import timedelta
        cutoff = datetime.now(timezone.utc) - timedelta(days=self.config.not_seen_days_to_inactive)

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
