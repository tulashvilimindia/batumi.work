"""Parse job tracking models with comprehensive logging.

These models track parse job execution, progress, detailed logs, and history.
Supports multi-job orchestration, job controls (pause/stop/restart), and
detailed per-item tracking with skip reasons.
"""
import uuid
from enum import Enum
from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    Index,
    Enum as SQLEnum,
    func,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from .base import Base


class JobStatus(str, Enum):
    """Parse job status values."""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    STOPPING = "stopping"  # Graceful stop in progress


class ItemStatus(str, Enum):
    """Parse job item status values."""
    PENDING = "pending"
    PARSING = "parsing"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class ItemResult(str, Enum):
    """Parse job item result types."""
    NEW = "new"
    UPDATED = "updated"
    SKIPPED = "skipped"
    FAILED = "failed"


class SkipReason(str, Enum):
    """Reasons why a job item was skipped."""
    DUPLICATE_URL = "duplicate_url"  # Already seen in this run
    UNCHANGED_CONTENT = "unchanged_content"  # Content hash matches
    NO_CATEGORY = "no_category"  # Could not determine category
    PARSE_ERROR = "parse_error"  # Error during parsing
    NO_TITLE = "no_title"  # No title found
    INVALID_DATA = "invalid_data"  # Data validation failed
    RATE_LIMITED = "rate_limited"  # Hit rate limit
    MANUAL_SKIP = "manual_skip"  # Manually skipped
    JOB_PAUSED = "job_paused"  # Job was paused during processing
    JOB_STOPPED = "job_stopped"  # Job was stopped


class LogLevel(str, Enum):
    """Log level values."""
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class ParseJob(Base):
    """Parse job record - tracks a parsing execution.

    A ParseJob represents a single parse execution, which could be:
    - scheduled: Regular scheduled parsing run
    - manual: Triggered manually from admin UI
    - single: Single job parse by ID
    - retry: Retry of failed items
    - batch: Part of a multi-job batch
    """

    __tablename__ = "parse_jobs"
    __table_args__ = (
        Index("idx_parse_jobs_status", "status"),
        Index("idx_parse_jobs_created_at", "created_at"),
        Index("idx_parse_jobs_source", "source"),
        Index("idx_parse_jobs_batch_id", "batch_id"),
    )

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # Batch support for multi-job execution
    batch_id = Column(
        UUID(as_uuid=True),
        nullable=True,
        comment="ID of parent batch if part of multi-job run"
    )

    # Job type and source
    job_type = Column(
        String(20),
        nullable=False,
        default="manual",
        comment="scheduled, manual, single, retry, batch"
    )
    source = Column(
        String(50),
        nullable=False,
        default="jobs.ge",
        comment="Parser source (jobs.ge, hr.ge, etc.)"
    )

    # Status with pause support
    status = Column(
        String(20),
        nullable=False,
        default="pending",
        comment="pending, running, paused, completed, failed, cancelled, stopping"
    )

    # Configuration used for this run
    config = Column(
        JSONB,
        nullable=True,
        comment="Regions, categories, and other config options"
    )

    # Scope - what this job is parsing
    target_region = Column(String(100), nullable=True, comment="Region being parsed (null=all)")
    target_category = Column(String(100), nullable=True, comment="Category being parsed (null=all)")

    # Progress tracking
    total_items = Column(Integer, default=0, comment="Total items to process (estimated)")
    processed_items = Column(Integer, default=0, comment="Items processed")
    successful_items = Column(Integer, default=0, comment="Successfully parsed")
    failed_items = Column(Integer, default=0, comment="Failed to parse")
    skipped_items = Column(Integer, default=0, comment="Skipped items")
    new_items = Column(Integer, default=0, comment="New jobs created")
    updated_items = Column(Integer, default=0, comment="Existing jobs updated")

    # Current progress info
    current_region = Column(String(100), nullable=True, comment="Currently processing region")
    current_category = Column(String(100), nullable=True, comment="Currently processing category")
    current_page = Column(Integer, nullable=True, comment="Current page being parsed")
    current_item = Column(String(200), nullable=True, comment="Current item being processed")

    # Timing
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    started_at = Column(DateTime(timezone=True), nullable=True)
    paused_at = Column(DateTime(timezone=True), nullable=True)
    resumed_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Total pause duration (accumulated)
    pause_duration_seconds = Column(Integer, default=0, comment="Total time spent paused")

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

    # Control flags
    should_pause = Column(Boolean, default=False, comment="Signal to pause the job")
    should_stop = Column(Boolean, default=False, comment="Signal to stop the job")

    # Relationships
    items = relationship(
        "ParseJobItem",
        back_populates="job",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    logs = relationship(
        "ParseJobLog",
        back_populates="job",
        cascade="all, delete-orphan",
        lazy="dynamic",
        order_by="ParseJobLog.created_at"
    )

    def to_dict(self, include_items=False, include_logs=False):
        """Convert to dictionary for API response."""
        result = {
            "id": str(self.id),
            "batch_id": str(self.batch_id) if self.batch_id else None,
            "job_type": self.job_type,
            "source": self.source,
            "status": self.status,
            "config": self.config,
            "scope": {
                "region": self.target_region,
                "category": self.target_category,
            },
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
                "item": self.current_item,
            },
            "timing": {
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "started_at": self.started_at.isoformat() if self.started_at else None,
                "paused_at": self.paused_at.isoformat() if self.paused_at else None,
                "resumed_at": self.resumed_at.isoformat() if self.resumed_at else None,
                "completed_at": self.completed_at.isoformat() if self.completed_at else None,
                "pause_duration_seconds": self.pause_duration_seconds,
                "duration_seconds": self._calculate_duration(),
            },
            "error_message": self.error_message,
            "errors": self.errors or [],
            "triggered_by": self.triggered_by,
            "controls": {
                "should_pause": self.should_pause,
                "should_stop": self.should_stop,
                "can_pause": self.status == "running",
                "can_resume": self.status == "paused",
                "can_stop": self.status in ("running", "paused"),
                "can_restart": self.status in ("completed", "failed", "cancelled"),
            },
        }

        if include_items:
            result["items"] = [item.to_dict() for item in self.items.limit(1000)]

        if include_logs:
            result["logs"] = [log.to_dict() for log in self.logs.limit(500)]

        return result

    def _calculate_duration(self):
        """Calculate total duration excluding pause time."""
        if not self.started_at:
            return None

        end_time = self.completed_at or func.now()
        if self.completed_at and self.started_at:
            total = (self.completed_at - self.started_at).total_seconds()
            return total - (self.pause_duration_seconds or 0)
        return None


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
        Index("idx_parse_job_items_result", "result"),
        Index("idx_parse_job_items_skip_reason", "skip_reason"),
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
    title = Column(String(500), nullable=True, comment="Job title (for display)")

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
        comment="new, updated, skipped, failed"
    )

    # Skip reason (if skipped)
    skip_reason = Column(
        String(50),
        nullable=True,
        comment="Why this item was skipped"
    )
    skip_details = Column(Text, nullable=True, comment="Additional skip reason details")

    # Created job reference
    created_job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
        comment="ID of created/updated job"
    )

    # Context (what region/category this item was parsed from)
    region = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    page = Column(Integer, nullable=True, comment="Page number where found")

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

    # Processing time
    processing_ms = Column(Integer, nullable=True, comment="Processing time in milliseconds")

    # Relationships
    job = relationship("ParseJob", back_populates="items")

    def to_dict(self):
        """Convert to dictionary for API response."""
        return {
            "id": str(self.id),
            "job_id": str(self.job_id),
            "external_id": self.external_id,
            "url": self.url,
            "title": self.title,
            "status": self.status,
            "result": self.result,
            "skip_reason": self.skip_reason,
            "skip_details": self.skip_details,
            "created_job_id": str(self.created_job_id) if self.created_job_id else None,
            "region": self.region,
            "category": self.category,
            "page": self.page,
            "error_message": self.error_message,
            "retry_count": self.retry_count,
            "timing": {
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "started_at": self.started_at.isoformat() if self.started_at else None,
                "completed_at": self.completed_at.isoformat() if self.completed_at else None,
                "processing_ms": self.processing_ms,
            },
        }


class ParseJobLog(Base):
    """Log entry for a parse job.

    Provides detailed logging for debugging and monitoring parse jobs.
    Logs can be filtered by region, category, and level.
    """

    __tablename__ = "parse_job_logs"
    __table_args__ = (
        Index("idx_parse_job_logs_job_id", "job_id"),
        Index("idx_parse_job_logs_level", "level"),
        Index("idx_parse_job_logs_region", "region"),
        Index("idx_parse_job_logs_category", "category"),
        Index("idx_parse_job_logs_created_at", "created_at"),
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

    # Log level
    level = Column(
        String(10),
        nullable=False,
        default="info",
        comment="debug, info, warning, error"
    )

    # Context
    region = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    external_id = Column(String(100), nullable=True, comment="Related job ID if applicable")

    # Log content
    message = Column(Text, nullable=False)
    details = Column(JSONB, nullable=True, comment="Additional structured details")

    # Timing
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    job = relationship("ParseJob", back_populates="logs")

    def to_dict(self):
        """Convert to dictionary for API response."""
        return {
            "id": str(self.id),
            "job_id": str(self.job_id),
            "level": self.level,
            "region": self.region,
            "category": self.category,
            "external_id": self.external_id,
            "message": self.message,
            "details": self.details,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ParseBatch(Base):
    """Batch of related parse jobs.

    Used for multi-job execution (e.g., parsing multiple regions
    or categories simultaneously).
    """

    __tablename__ = "parse_batches"
    __table_args__ = (
        Index("idx_parse_batches_status", "status"),
        Index("idx_parse_batches_created_at", "created_at"),
    )

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # Status
    status = Column(
        String(20),
        nullable=False,
        default="pending",
        comment="pending, running, paused, completed, failed, cancelled"
    )

    # Configuration
    config = Column(JSONB, nullable=True, comment="Batch configuration")
    mode = Column(
        String(20),
        nullable=False,
        default="parallel",
        comment="parallel or sequential"
    )

    # Counts
    total_jobs = Column(Integer, default=0)
    completed_jobs = Column(Integer, default=0)
    failed_jobs = Column(Integer, default=0)

    # Timing
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    triggered_by = Column(String(50), nullable=False, default="system")

    def to_dict(self):
        """Convert to dictionary for API response."""
        return {
            "id": str(self.id),
            "status": self.status,
            "config": self.config,
            "mode": self.mode,
            "jobs": {
                "total": self.total_jobs,
                "completed": self.completed_jobs,
                "failed": self.failed_jobs,
            },
            "timing": {
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "started_at": self.started_at.isoformat() if self.started_at else None,
                "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            },
            "triggered_by": self.triggered_by,
        }
