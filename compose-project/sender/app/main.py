"""Main entry point for Channel Sender Service.

Runs both:
1. APScheduler for scheduled tasks (job scanning, queue processing, reporting)
2. FastAPI Admin API for management endpoints
"""
import asyncio
import signal
import sys
from contextlib import asynccontextmanager

import uvicorn
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.api.main import app
from app.tasks.job_scanner import scan_new_jobs
from app.tasks.queue_processor import process_queue
from app.tasks.reporting import send_daily_report, cleanup_old_entries

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Global scheduler instance
scheduler: AsyncIOScheduler = None


def create_scheduler() -> AsyncIOScheduler:
    """Create and configure the APScheduler instance."""
    sched = AsyncIOScheduler(timezone="UTC")

    # Task: Scan for new jobs (every 5 minutes)
    sched.add_job(
        scan_new_jobs,
        trigger=IntervalTrigger(minutes=5),
        id="scan_new_jobs",
        name="Scan for new jobs to queue",
        replace_existing=True,
        max_instances=1,
    )

    # Task: Process queue (every 30 seconds)
    sched.add_job(
        process_queue,
        trigger=IntervalTrigger(seconds=30),
        id="process_queue",
        name="Process message queue",
        replace_existing=True,
        max_instances=1,
    )

    # Task: Cleanup old entries (daily at 3 AM UTC)
    sched.add_job(
        cleanup_old_entries,
        trigger=CronTrigger(hour=3, minute=0),
        id="cleanup_old",
        name="Cleanup old queue entries",
        replace_existing=True,
        max_instances=1,
    )

    # Task: Daily report (daily at 5:30 PM UTC = 9:30 PM Georgia time)
    sched.add_job(
        send_daily_report,
        trigger=CronTrigger(hour=17, minute=30),
        id="daily_report",
        name="Send daily report",
        replace_existing=True,
        max_instances=1,
    )

    return sched


@asynccontextmanager
async def lifespan(app):
    """FastAPI lifespan handler for startup/shutdown."""
    global scheduler

    logger.info("starting_channel_sender_service", version=settings.APP_VERSION)

    # Create and start scheduler
    scheduler = create_scheduler()
    scheduler.start()
    logger.info("scheduler_started", jobs=len(scheduler.get_jobs()))

    # Run initial job scan on startup
    try:
        await scan_new_jobs()
    except Exception as e:
        logger.error("initial_scan_failed", error=str(e))

    yield

    # Shutdown
    logger.info("shutting_down_service")
    if scheduler:
        scheduler.shutdown(wait=False)
        logger.info("scheduler_stopped")


# Attach lifespan to app
app.router.lifespan_context = lifespan


def handle_signal(signum, frame):
    """Handle shutdown signals."""
    logger.info("received_signal", signal=signum)
    sys.exit(0)


async def main():
    """Main entry point."""
    # Setup signal handlers
    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)

    logger.info(
        "channel_sender_starting",
        telegram_channel=settings.TELEGRAM_CHANNEL_ID,
        api_port=settings.API_PORT,
    )

    # Run uvicorn server
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=settings.API_PORT,
        log_level=settings.LOG_LEVEL.lower(),
    )
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())
