"""Parse job tracking models.

These models track parse job execution, progress, and history.
Used for real-time progress tracking and job history/reporting.
"""
import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    Index,
    func,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from .base import Base


class ParseJob(Base):
    """Parse job record - tracks a parsing execution.

    A ParseJob represents a single parse execution, which could be:
    - scheduled: Regular scheduled parsing run
    - manual: Triggered manually from admin UI
    - single: Single job parse by ID
    - retry: Retry of failed items
    """

    __tablename__ = "parse_jobs"
    __table_args__ = (
        Index("idx_parse_jobs_status", "status"),
        Index("idx_parse_jobs_created_at", "created_at"),
        Index("idx_parse_jobs_source", "source"),
    )

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # Job type and source
    job_type = Column(
        String(20),
        nullable=False,
        default="manual",
        comment="scheduled, manual, single, retry"
    )
    source = Column(
        String(50),
        nullable=False,
        default="jobs.ge",
        comment="Parser source (jobs.ge, hr.ge, etc.)"
    )

    # Status
    status = Column(
        String(20),
        nullable=False,
        default="pending",
        comment="pending, running, completed, failed, cancelled"
    )

    # Configuration used for this run
    config = Column(
        JSONB,
        nullable=True,
        comment="Regions, categories, and other config options"
    )

    # Progress tracking
    total_items = Column(Integer, default=0, comment="Total items to process")
    processed_items = Column(Integer, default=0, comment="Items processed")
    successful_items = Column(Integer, default=0, comment="Successfully parsed")
    failed_items = Column(Integer, default=0, comment="Failed to parse")
    skipped_items = Column(Integer, default=0, comment="Skipped (already exists)")
    new_items = Column(Integer, default=0, comment="New jobs created")
    updated_items = Column(Integer, default=0, comment="Existing jobs updated")

    # Current progress info
    current_region = Column(String(100), nullable=True, comment="Currently processing region")
    current_category = Column(String(100), nullable=True, comment="Currently processing category")
    current_page = Column(Integer, nullable=True, comment="Current page being parsed")

    # Timing
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Error information
    error_message = Column(Text, nullable=True)
    errors = Column(JSONB, nullable=True, default=list, comment="List of error messages")

    # Metadata
    triggered_by = Column(
        String(50),
        nullable=False,
        default="system",
        comment="Who triggered this job (system, admin, api)"
    )

    # Relationships
    items = relationship(
        "ParseJobItem",
        back_populates="job",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )

    def to_dict(self):
        """Convert to dictionary for API response."""
        return {
            "id": str(self.id),
            "job_type": self.job_type,
            "source": self.source,
            "status": self.status,
            "config": self.config,
            "progress": {
                "total": self.total_items,
                "processed": self.processed_items,
                "successful": self.successful_items,
                "failed": self.failed_items,
                "skipped": self.skipped_items,
                "new": self.new_items,
                "updated": self.updated_items,
                "percentage": round(
                    (self.processed_items / self.total_items * 100)
                    if self.total_items > 0 else 0, 1
                ),
            },
            "current": {
                "region": self.current_region,
                "category": self.current_category,
                "page": self.current_page,
            },
            "timing": {
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "started_at": self.started_at.isoformat() if self.started_at else None,
                "completed_at": self.completed_at.isoformat() if self.completed_at else None,
                "duration_seconds": (
                    (self.completed_at - self.started_at).total_seconds()
                    if self.completed_at and self.started_at else None
                ),
            },
            "error_message": self.error_message,
            "errors": self.errors or [],
            "triggered_by": self.triggered_by,
        }


class ParseJobItem(Base):
    """Individual item within a parse job.

    Tracks the status of each individual job being parsed,
    allowing for detailed progress tracking and retry of failed items.
    """

    __tablename__ = "parse_job_items"
    __table_args__ = (
        Index("idx_parse_job_items_job_id", "job_id"),
        Index("idx_parse_job_items_status", "status"),
        Index("idx_parse_job_items_external_id", "external_id"),
    )

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # Parent job
    job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("parse_jobs.id", ondelete="CASCADE"),
        nullable=False,
    )

    # External identification
    external_id = Column(
        String(100),
        nullable=True,
        comment="External job ID (e.g., jobs.ge ID)"
    )
    url = Column(String(500), nullable=True, comment="Source URL")

    # Status
    status = Column(
        String(20),
        nullable=False,
        default="pending",
        comment="pending, parsing, completed, failed, skipped"
    )

    # Result
    result = Column(
        String(20),
        nullable=True,
        comment="new, updated, skipped (result type)"
    )
    created_job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
        comment="ID of created/updated job"
    )

    # Context (what region/category this item was parsed from)
    region = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)

    # Error information
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)

    # Timing
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    job = relationship("ParseJob", back_populates="items")

    def to_dict(self):
        """Convert to dictionary for API response."""
        return {
            "id": str(self.id),
            "job_id": str(self.job_id),
            "external_id": self.external_id,
            "url": self.url,
            "status": self.status,
            "result": self.result,
            "created_job_id": str(self.created_job_id) if self.created_job_id else None,
            "region": self.region,
            "category": self.category,
            "error_message": self.error_message,
            "retry_count": self.retry_count,
            "timing": {
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "started_at": self.started_at.isoformat() if self.started_at else None,
                "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            },
        }
