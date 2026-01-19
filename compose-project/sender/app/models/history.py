"""Channel Message History model."""
from sqlalchemy import Column, String, Integer, BigInteger, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, UUIDMixin, TimestampMixin


class ChannelMessageHistory(Base, UUIDMixin, TimestampMixin):
    """History of messages sent to Telegram channel."""

    __tablename__ = "channel_message_history"
    __table_args__ = (
        Index("idx_history_job", "job_id"),
        Index("idx_history_status", "status"),
        Index("idx_history_sent_at", "sent_at"),
        Index("idx_history_telegram_msg", "telegram_message_id"),
    )

    # Job reference
    job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Queue reference (nullable - for manual sends)
    queue_id = Column(
        UUID(as_uuid=True),
        ForeignKey("channel_message_queue.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Telegram message ID (for deletion/editing)
    telegram_message_id = Column(BigInteger, nullable=True)

    # Status: sent, failed, deleted
    status = Column(String(20), nullable=False, index=True)

    # Message content
    message_text = Column(Text, nullable=True)

    # Error info (for failed messages)
    error_message = Column(Text, nullable=True)

    # Retry count
    retry_count = Column(Integer, nullable=False, default=0)

    # When the message was sent
    sent_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<ChannelMessageHistory(id={self.id}, job_id={self.job_id}, status={self.status})>"
