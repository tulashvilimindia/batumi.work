"""Task to scan for new jobs and add them to the queue."""
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.database import get_db_session
from app.services.queue_service import QueueService

logger = get_logger(__name__)


async def scan_new_jobs() -> int:
    """Find active jobs not yet queued or sent, and add them to the queue.

    Jobs are considered "new" if:
    - status = 'active'
    - NOT in channel_message_queue (any status)
    - NOT in channel_message_history with status='sent'

    Returns number of jobs added to queue.
    """
    logger.info("job_scan_started")

    session = await get_db_session()
    try:
        # Query to find new jobs not yet queued or successfully sent
        query = text("""
            SELECT j.id
            FROM jobs j
            WHERE j.status = 'active'
              AND NOT EXISTS (
                  SELECT 1 FROM channel_message_queue q WHERE q.job_id = j.id
              )
              AND NOT EXISTS (
                  SELECT 1 FROM channel_message_history h
                  WHERE h.job_id = j.id AND h.status = 'sent'
              )
            ORDER BY j.first_seen_at ASC NULLS LAST, j.created_at ASC
            LIMIT 100
        """)

        result = await session.execute(query)
        new_job_ids = [row[0] for row in result.fetchall()]

        if not new_job_ids:
            logger.info("job_scan_completed", new_jobs_found=0)
            return 0

        # Add jobs to queue
        queue_service = QueueService(session)
        added_count = 0

        for job_id in new_job_ids:
            try:
                await queue_service.add_to_queue(job_id)
                added_count += 1
            except Exception as e:
                # Job might already be in queue (race condition)
                logger.warning(
                    "failed_to_add_job_to_queue",
                    job_id=str(job_id),
                    error=str(e),
                )

        await session.commit()
        logger.info("job_scan_completed", new_jobs_found=len(new_job_ids), added_to_queue=added_count)
        return added_count

    except Exception as e:
        await session.rollback()
        logger.exception("job_scan_error", error=str(e))
        raise
    finally:
        await session.close()


async def get_jobs_not_in_queue_count() -> int:
    """Get count of jobs that should be queued but aren't."""
    session = await get_db_session()
    try:
        query = text("""
            SELECT COUNT(*)
            FROM jobs j
            WHERE j.status = 'active'
              AND NOT EXISTS (
                  SELECT 1 FROM channel_message_queue q WHERE q.job_id = j.id
              )
              AND NOT EXISTS (
                  SELECT 1 FROM channel_message_history h
                  WHERE h.job_id = j.id AND h.status = 'sent'
              )
        """)
        result = await session.execute(query)
        return result.scalar() or 0
    finally:
        await session.close()
