"""Parser worker main entry point."""
import asyncio
import signal
import sys
from datetime import datetime

import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import get_config
from app.core.runner import ParserRunner
from app.tasks.analytics import (
    refresh_materialized_views,
    cleanup_old_analytics,
    generate_daily_summary,
)

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


class WorkerService:
    """Parser worker service with scheduling."""

    def __init__(self):
        self.config = get_config()
        self.scheduler = AsyncIOScheduler()
        self.runner: ParserRunner | None = None
        self._shutdown_event = asyncio.Event()

    async def setup(self):
        """Initialize the worker service."""
        # Import adapters
        adapters = {}

        # Import jobs.ge adapter if enabled
        if "jobs.ge" in self.config.enabled_sources:
            try:
                from app.parsers.jobs_ge import JobsGeAdapter
                adapters["jobs.ge"] = JobsGeAdapter
                logger.info("adapter_loaded", source="jobs.ge")
            except ImportError as e:
                logger.warning("adapter_import_failed", source="jobs.ge", error=str(e))

        # Import hr.ge adapter if enabled
        if "hr.ge" in self.config.enabled_sources:
            try:
                from app.parsers.hr_ge import HrGeAdapter
                adapters["hr.ge"] = HrGeAdapter
                logger.info("adapter_loaded", source="hr.ge")
            except ImportError as e:
                logger.warning("adapter_import_failed", source="hr.ge", error=str(e))

        self.runner = ParserRunner(self.config, adapters)
        logger.info(
            "worker_initialized",
            enabled_sources=self.config.enabled_sources,
            regions=self.config.regions,
            interval_minutes=self.config.parser_interval_minutes,
        )

    async def run_parsers(self):
        """Execute a full parsing run."""
        if not self.runner:
            logger.error("runner_not_initialized")
            return

        logger.info("parsing_run_started", timestamp=datetime.utcnow().isoformat())

        try:
            results = await self.runner.run_all()

            for source, result in results.items():
                logger.info(
                    "source_completed",
                    source=source,
                    jobs_found=len(result.jobs),
                    total_found=result.total_found,
                    errors=len(result.errors),
                )

            # Deactivate old jobs
            deactivated = await self.runner.deactivate_not_seen()
            if deactivated:
                logger.info("old_jobs_deactivated", count=deactivated)

        except Exception as e:
            logger.error("parsing_run_failed", error=str(e), exc_info=True)

    def setup_scheduler(self):
        """Set up the job scheduler."""
        # Schedule parsing runs
        self.scheduler.add_job(
            self.run_parsers,
            trigger=IntervalTrigger(minutes=self.config.parser_interval_minutes),
            id="parser_run",
            name="Parser Run",
            replace_existing=True,
            max_instances=1,
        )

        # Run immediately on startup
        self.scheduler.add_job(
            self.run_parsers,
            id="parser_run_immediate",
            name="Parser Run (Immediate)",
            next_run_time=datetime.now(),
        )

        # Schedule analytics view refresh (every 4 hours)
        self.scheduler.add_job(
            refresh_materialized_views,
            trigger=IntervalTrigger(hours=4),
            id="analytics_refresh",
            name="Analytics View Refresh",
            replace_existing=True,
            max_instances=1,
        )

        # Schedule analytics cleanup (weekly on Sunday at 3 AM)
        from apscheduler.triggers.cron import CronTrigger
        self.scheduler.add_job(
            cleanup_old_analytics,
            trigger=CronTrigger(day_of_week="sun", hour=3, minute=0),
            id="analytics_cleanup",
            name="Analytics Data Cleanup",
            replace_existing=True,
        )

        # Schedule daily summary (daily at 5 AM)
        self.scheduler.add_job(
            generate_daily_summary,
            trigger=CronTrigger(hour=5, minute=0),
            id="daily_summary",
            name="Daily Summary Generation",
            replace_existing=True,
        )

        logger.info(
            "scheduler_configured",
            interval_minutes=self.config.parser_interval_minutes,
            analytics_refresh_hours=4,
        )

    async def start(self):
        """Start the worker service."""
        await self.setup()
        self.setup_scheduler()
        self.scheduler.start()

        logger.info("worker_started")

        # Wait for shutdown signal
        await self._shutdown_event.wait()

    async def stop(self):
        """Stop the worker service."""
        logger.info("worker_stopping")
        self.scheduler.shutdown(wait=True)
        self._shutdown_event.set()
        logger.info("worker_stopped")


async def main():
    """Main entry point."""
    worker = WorkerService()

    # Set up signal handlers
    loop = asyncio.get_event_loop()

    def signal_handler():
        logger.info("shutdown_signal_received")
        asyncio.create_task(worker.stop())

    for sig in (signal.SIGTERM, signal.SIGINT):
        try:
            loop.add_signal_handler(sig, signal_handler)
        except NotImplementedError:
            # Windows doesn't support add_signal_handler
            signal.signal(sig, lambda s, f: signal_handler())

    try:
        await worker.start()
    except Exception as e:
        logger.error("worker_error", error=str(e), exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
