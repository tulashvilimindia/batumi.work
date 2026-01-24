import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.parser.scraper import run_parser
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Global scheduler instance
scheduler = AsyncIOScheduler()


async def scheduled_parse_job():
    """Job function that runs on schedule."""
    logger.info(f"Starting scheduled parse at {datetime.utcnow()}")
    db: Session = SessionLocal()
    try:
        result = await run_parser(db, run_type="full")
        logger.info(f"Scheduled parse completed: {result}")
    except Exception as e:
        logger.error(f"Scheduled parse failed: {e}")
    finally:
        db.close()


def start_scheduler():
    """Start the APScheduler with configured interval."""
    hours = settings.parser_schedule_hours
    logger.info(f"Starting scheduler with {hours} hour interval")

    scheduler.add_job(
        scheduled_parse_job,
        trigger=IntervalTrigger(hours=hours),
        id="hrge_parser",
        name="HR.GE Job Parser",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler started successfully")


def stop_scheduler():
    """Stop the scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped")


def get_scheduler_status() -> dict:
    """Get current scheduler status."""
    job = scheduler.get_job("hrge_parser")
    if job:
        return {
            "running": scheduler.running,
            "job_id": job.id,
            "job_name": job.name,
            "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
            "interval_hours": settings.parser_schedule_hours,
        }
    return {
        "running": scheduler.running,
        "job_id": None,
        "next_run_time": None,
    }
