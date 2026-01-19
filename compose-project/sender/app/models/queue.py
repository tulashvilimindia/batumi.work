"""Channel Message Queue model."""
from sqlalchemy import Column, String, Integer, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, UUIDMixin, TimestampMixin


class ChannelMessageQueue(Base, UUIDMixin, TimestampMixin):
    """Queue for messages pending to be sent to Telegram channel."""

    __tablename__ = "channel_message_queue"
    __table_args__ = (
        Index("idx_queue_status", "status"),
        Index("idx_queue_scheduled", "scheduled_at"),
        Index("idx_queue_priority", "priority", "created_at"),
        {"extend_existing": True},
    )

    # Job reference (unique - one job can only be in queue once)
    # Note: FK constraint exists in DB via migration, not defined here
    # to avoid SQLAlchemy trying to resolve the jobs table
    job_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        unique=True,
    )

    # Queue status: pending, processing, sent, failed, cancelled
    status = Column(String(20), nullable=False, default="pending", index=True)

    # Priority (higher = more urgent)
    priority = Column(Integer, nullable=False, default=0)

    # Scheduled send time (for business hours)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<ChannelMessageQueue(id={self.id}, job_id={self.job_id}, status={self.status})>"
