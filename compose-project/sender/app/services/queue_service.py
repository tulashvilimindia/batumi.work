"""Queue management service for channel messages."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, update, delete, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.queue import ChannelMessageQueue
from app.models.history import ChannelMessageHistory
from app.services.scheduler_service import SchedulerService

logger = get_logger(__name__)


class QueueService:
    """Manages the channel message queue."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_to_queue(
        self,
        job_id: UUID,
        priority: int = 0,
        scheduled_at: Optional[datetime] = None,
    ) -> ChannelMessageQueue:
        """Add a job to the message queue."""
        # Calculate scheduled time if not provided
        if scheduled_at is None:
            scheduled_at = SchedulerService.calculate_scheduled_time(priority)

        queue_item = ChannelMessageQueue(
            job_id=job_id,
            status="pending",
            priority=priority,
            scheduled_at=scheduled_at,
        )

        self.session.add(queue_item)
        await self.session.flush()

        logger.info(
            "job_added_to_queue",
            job_id=str(job_id),
            queue_id=str(queue_item.id),
            scheduled_at=scheduled_at.isoformat() if scheduled_at else None,
        )

        return queue_item

    async def get_pending_items(
        self,
        limit: int = 10,
        include_scheduled: bool = True,
    ) -> List[ChannelMessageQueue]:
        """Get pending queue items ready to be processed."""
        now = datetime.utcnow()

        conditions = [ChannelMessageQueue.status == "pending"]

        if include_scheduled:
            # Include items with no scheduled time or scheduled time has passed
            conditions.append(
                or_(
                    ChannelMessageQueue.scheduled_at.is_(None),
                    ChannelMessageQueue.scheduled_at <= now,
                )
            )

        query = (
            select(ChannelMessageQueue)
            .where(and_(*conditions))
            .order_by(
                ChannelMessageQueue.priority.desc(),
                ChannelMessageQueue.created_at.asc(),
            )
            .limit(limit)
        )

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_queue_item(self, queue_id: UUID) -> Optional[ChannelMessageQueue]:
        """Get a single queue item by ID."""
        query = select(ChannelMessageQueue).where(ChannelMessageQueue.id == queue_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_queue_item_by_job(self, job_id: UUID) -> Optional[ChannelMessageQueue]:
        """Get queue item for a specific job."""
        query = select(ChannelMessageQueue).where(ChannelMessageQueue.job_id == job_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def update_status(
        self,
        queue_id: UUID,
        status: str,
    ) -> None:
        """Update queue item status."""
        stmt = (
            update(ChannelMessageQueue)
            .where(ChannelMessageQueue.id == queue_id)
            .values(status=status, updated_at=func.now())
        )
        await self.session.execute(stmt)

        logger.debug("queue_status_updated", queue_id=str(queue_id), status=status)

    async def mark_as_processing(self, queue_id: UUID) -> None:
        """Mark queue item as being processed."""
        await self.update_status(queue_id, "processing")

    async def mark_as_sent(self, queue_id: UUID) -> None:
        """Mark queue item as sent."""
        await self.update_status(queue_id, "sent")

    async def mark_as_failed(self, queue_id: UUID) -> None:
        """Mark queue item as failed."""
        await self.update_status(queue_id, "failed")

    async def cancel_queue_item(self, queue_id: UUID) -> bool:
        """Cancel a pending queue item."""
        stmt = (
            update(ChannelMessageQueue)
            .where(
                and_(
                    ChannelMessageQueue.id == queue_id,
                    ChannelMessageQueue.status == "pending",
                )
            )
            .values(status="cancelled", updated_at=func.now())
        )
        result = await self.session.execute(stmt)
        cancelled = result.rowcount > 0

        if cancelled:
            logger.info("queue_item_cancelled", queue_id=str(queue_id))

        return cancelled

    async def delete_queue_item(self, queue_id: UUID) -> bool:
        """Delete a queue item."""
        stmt = delete(ChannelMessageQueue).where(ChannelMessageQueue.id == queue_id)
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    async def get_queue_stats(self) -> dict:
        """Get queue statistics."""
        # Count by status
        status_query = (
            select(
                ChannelMessageQueue.status,
                func.count(ChannelMessageQueue.id).label("count"),
            )
            .group_by(ChannelMessageQueue.status)
        )
        result = await self.session.execute(status_query)
        status_counts = {row.status: row.count for row in result.all()}

        return {
            "pending": status_counts.get("pending", 0),
            "processing": status_counts.get("processing", 0),
            "sent": status_counts.get("sent", 0),
            "failed": status_counts.get("failed", 0),
            "cancelled": status_counts.get("cancelled", 0),
            "total": sum(status_counts.values()),
        }

    async def cleanup_old_entries(self, days: int = 30) -> int:
        """Remove old cancelled and sent entries from queue."""
        cutoff = datetime.utcnow() - timedelta(days=days)

        stmt = delete(ChannelMessageQueue).where(
            and_(
                ChannelMessageQueue.status.in_(["cancelled", "sent"]),
                ChannelMessageQueue.updated_at < cutoff,
            )
        )
        result = await self.session.execute(stmt)

        logger.info("queue_cleanup_completed", deleted_count=result.rowcount)
        return result.rowcount

    async def get_all_pending(
        self,
        offset: int = 0,
        limit: int = 50,
    ) -> List[ChannelMessageQueue]:
        """Get all pending queue items with pagination."""
        query = (
            select(ChannelMessageQueue)
            .where(ChannelMessageQueue.status == "pending")
            .order_by(
                ChannelMessageQueue.priority.desc(),
                ChannelMessageQueue.created_at.asc(),
            )
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_failed_items(self, limit: int = 50) -> List[ChannelMessageQueue]:
        """Get failed queue items."""
        query = (
            select(ChannelMessageQueue)
            .where(ChannelMessageQueue.status == "failed")
            .order_by(ChannelMessageQueue.updated_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def retry_failed(self, queue_id: UUID) -> bool:
        """Reset a failed item to pending status for retry."""
        stmt = (
            update(ChannelMessageQueue)
            .where(
                and_(
                    ChannelMessageQueue.id == queue_id,
                    ChannelMessageQueue.status == "failed",
                )
            )
            .values(
                status="pending",
                scheduled_at=SchedulerService.calculate_scheduled_time(),
                updated_at=func.now(),
            )
        )
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    async def retry_all_failed(self) -> int:
        """Reset all failed items to pending status."""
        scheduled_at = SchedulerService.calculate_scheduled_time()

        stmt = (
            update(ChannelMessageQueue)
            .where(ChannelMessageQueue.status == "failed")
            .values(
                status="pending",
                scheduled_at=scheduled_at,
                updated_at=func.now(),
            )
        )
        result = await self.session.execute(stmt)

        logger.info("retry_all_failed", count=result.rowcount)
        return result.rowcount


# Import here to avoid circular imports
from datetime import timedelta
