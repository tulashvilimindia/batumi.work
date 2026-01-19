"""Task to process the message queue."""
from app.core.logging import get_logger
from app.core.database import get_db_session
from app.services.sender_service import SenderService
from app.services.scheduler_service import SchedulerService

logger = get_logger(__name__)

# Global pause state (shared across all processors)
_sender_paused = False


def is_sender_paused() -> bool:
    """Check if sender is paused."""
    return _sender_paused


def pause_sender() -> None:
    """Pause the sender globally."""
    global _sender_paused
    _sender_paused = True
    logger.info("sender_paused_globally")


def resume_sender() -> None:
    """Resume the sender globally."""
    global _sender_paused
    _sender_paused = False
    logger.info("sender_resumed_globally")


async def process_queue() -> int:
    """Process pending messages in the queue.

    This task:
    1. Checks if we're in business hours
    2. Checks rate limits
    3. Sends pending messages to Telegram

    Returns number of messages sent.
    """
    if _sender_paused:
        logger.debug("queue_processing_skipped", reason="paused")
        return 0

    if not SchedulerService.is_business_hours():
        logger.debug("queue_processing_skipped", reason="outside_business_hours")
        return 0

    logger.debug("queue_processing_started")

    session = await get_db_session()
    try:
        sender = SenderService(session)

        if _sender_paused:
            sender.pause()

        sent_count = await sender.process_queue(batch_size=5)

        if sent_count > 0:
            logger.info("queue_processing_completed", messages_sent=sent_count)

        return sent_count

    except Exception as e:
        await session.rollback()
        logger.exception("queue_processing_error", error=str(e))
        return 0
    finally:
        await session.close()


async def get_queue_status() -> dict:
    """Get current queue processing status."""
    session = await get_db_session()
    try:
        sender = SenderService(session)
        from app.services.queue_service import QueueService

        queue_service = QueueService(session)
        queue_stats = await queue_service.get_queue_stats()
        rate_limits = sender.get_rate_limit_status()
        business_hours = SchedulerService.get_business_hours_status()

        return {
            "paused": _sender_paused,
            "queue": queue_stats,
            "rate_limits": rate_limits,
            "business_hours": business_hours,
        }
    finally:
        await session.close()
