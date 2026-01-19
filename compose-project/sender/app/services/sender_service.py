"""Main sender service that orchestrates message sending."""
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.config import settings
from app.core.logging import get_logger
from app.core.telegram import TelegramClient, TelegramAPIError
from app.models.queue import ChannelMessageQueue
from app.models.history import ChannelMessageHistory
from app.services.formatter_service import FormatterService
from app.services.scheduler_service import SchedulerService
from app.services.queue_service import QueueService

logger = get_logger(__name__)


class SenderService:
    """Orchestrates sending messages to Telegram channel."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.queue_service = QueueService(session)
        self.formatter = FormatterService()
        self._paused = False
        self._messages_sent_this_minute = 0
        self._messages_sent_this_hour = 0
        self._minute_start = datetime.utcnow()
        self._hour_start = datetime.utcnow()

    @property
    def is_paused(self) -> bool:
        return self._paused

    def pause(self) -> None:
        """Pause message sending."""
        self._paused = True
        logger.info("sender_paused")

    def resume(self) -> None:
        """Resume message sending."""
        self._paused = False
        logger.info("sender_resumed")

    def _reset_rate_limits(self) -> None:
        """Reset rate limit counters if time windows have passed."""
        now = datetime.utcnow()

        # Reset minute counter
        if (now - self._minute_start).total_seconds() >= 60:
            self._messages_sent_this_minute = 0
            self._minute_start = now

        # Reset hour counter
        if (now - self._hour_start).total_seconds() >= 3600:
            self._messages_sent_this_hour = 0
            self._hour_start = now

    def can_send_message(self) -> bool:
        """Check if we can send a message based on rate limits."""
        if self._paused:
            return False

        if not SchedulerService.is_business_hours():
            return False

        self._reset_rate_limits()

        if self._messages_sent_this_minute >= settings.MAX_MESSAGES_PER_MINUTE:
            return False

        if self._messages_sent_this_hour >= settings.MAX_MESSAGES_PER_HOUR:
            return False

        return True

    def _increment_counters(self) -> None:
        """Increment rate limit counters after sending a message."""
        self._messages_sent_this_minute += 1
        self._messages_sent_this_hour += 1

    async def get_job_data(self, job_id: UUID) -> Optional[Dict[str, Any]]:
        """Fetch job data with category for message formatting."""
        # Query job with category join
        query = """
            SELECT
                j.id,
                j.title_ge,
                j.company_name,
                j.remote_type,
                j.has_salary,
                j.salary_min,
                j.salary_max,
                j.salary_currency,
                c.name_ge as category_name_ge
            FROM jobs j
            LEFT JOIN categories c ON j.category_id = c.id
            WHERE j.id = :job_id
        """
        from sqlalchemy import text
        result = await self.session.execute(text(query), {"job_id": job_id})
        row = result.fetchone()

        if not row:
            return None

        return {
            "id": row.id,
            "title_ge": row.title_ge,
            "company_name": row.company_name,
            "remote_type": row.remote_type,
            "has_salary": row.has_salary,
            "salary_min": row.salary_min,
            "salary_max": row.salary_max,
            "salary_currency": row.salary_currency or "GEL",
            "category_name_ge": row.category_name_ge or "სხვა",
        }

    async def send_job_message(
        self,
        queue_item: ChannelMessageQueue,
    ) -> ChannelMessageHistory:
        """Send a single job message to Telegram channel."""
        job_id = queue_item.job_id
        history = ChannelMessageHistory(
            job_id=job_id,
            queue_id=queue_item.id,
            status="failed",
            retry_count=0,
        )

        try:
            # Mark as processing
            await self.queue_service.mark_as_processing(queue_item.id)

            # Get job data
            job_data = await self.get_job_data(job_id)
            if not job_data:
                history.error_message = "Job not found"
                self.session.add(history)
                await self.queue_service.mark_as_failed(queue_item.id)
                return history

            # Format message
            message_text = self.formatter.format_message(job_data)
            history.message_text = message_text

            # Send to Telegram
            async with TelegramClient() as client:
                result = await client.send_message(message_text)

            # Success
            history.status = "sent"
            history.telegram_message_id = result.get("message_id")
            history.sent_at = datetime.utcnow()

            await self.queue_service.mark_as_sent(queue_item.id)
            self._increment_counters()

            logger.info(
                "message_sent_successfully",
                job_id=str(job_id),
                telegram_message_id=history.telegram_message_id,
            )

        except TelegramAPIError as e:
            history.error_message = str(e.message)
            await self.queue_service.mark_as_failed(queue_item.id)
            logger.error(
                "telegram_send_failed",
                job_id=str(job_id),
                error=e.message,
                error_code=e.error_code,
            )

        except Exception as e:
            history.error_message = str(e)
            await self.queue_service.mark_as_failed(queue_item.id)
            logger.exception("send_message_error", job_id=str(job_id))

        self.session.add(history)
        return history

    async def process_queue(self, batch_size: int = 5) -> int:
        """Process pending queue items.

        Returns number of messages sent.
        """
        if not self.can_send_message():
            logger.debug("cannot_send", paused=self._paused, business_hours=SchedulerService.is_business_hours())
            return 0

        # Get pending items
        items = await self.queue_service.get_pending_items(limit=batch_size)

        if not items:
            return 0

        sent_count = 0
        for item in items:
            if not self.can_send_message():
                break

            history = await self.send_job_message(item)
            if history.status == "sent":
                sent_count += 1

            # Delay between messages
            await asyncio.sleep(settings.MESSAGE_DELAY_SECONDS)

        await self.session.commit()
        return sent_count

    def get_rate_limit_status(self) -> dict:
        """Get current rate limit status."""
        self._reset_rate_limits()
        return {
            "messages_sent_this_minute": self._messages_sent_this_minute,
            "max_per_minute": settings.MAX_MESSAGES_PER_MINUTE,
            "messages_sent_this_hour": self._messages_sent_this_hour,
            "max_per_hour": settings.MAX_MESSAGES_PER_HOUR,
            "message_delay_seconds": settings.MESSAGE_DELAY_SECONDS,
            "can_send_now": self.can_send_message(),
        }


class HistoryService:
    """Service for managing message history."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_history(
        self,
        status: Optional[str] = None,
        job_id: Optional[UUID] = None,
        offset: int = 0,
        limit: int = 50,
    ) -> list[ChannelMessageHistory]:
        """Get message history with filters."""
        query = select(ChannelMessageHistory)

        conditions = []
        if status:
            conditions.append(ChannelMessageHistory.status == status)
        if job_id:
            conditions.append(ChannelMessageHistory.job_id == job_id)

        if conditions:
            query = query.where(and_(*conditions))

        query = (
            query
            .order_by(ChannelMessageHistory.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_history_stats(self) -> dict:
        """Get history statistics."""
        from sqlalchemy import func

        query = (
            select(
                ChannelMessageHistory.status,
                func.count(ChannelMessageHistory.id).label("count"),
            )
            .group_by(ChannelMessageHistory.status)
        )
        result = await self.session.execute(query)
        status_counts = {row.status: row.count for row in result.all()}

        return {
            "sent": status_counts.get("sent", 0),
            "failed": status_counts.get("failed", 0),
            "deleted": status_counts.get("deleted", 0),
            "total": sum(status_counts.values()),
        }

    async def get_recent_sent(self, limit: int = 10) -> list[ChannelMessageHistory]:
        """Get recently sent messages."""
        query = (
            select(ChannelMessageHistory)
            .where(ChannelMessageHistory.status == "sent")
            .order_by(ChannelMessageHistory.sent_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
