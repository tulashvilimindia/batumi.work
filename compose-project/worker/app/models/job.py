"""Job model for the parser worker.

This is a minimal model for upsert operations during parsing.
The full model with relationships is in the API service.
"""
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    Text,
    DateTime,
    UniqueConstraint,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID

from .base import Base, UUIDMixin, TimestampMixin


class Job(Base, UUIDMixin, TimestampMixin):
    """Job posting model for parser operations."""

    __tablename__ = "jobs"
    __table_args__ = (
        UniqueConstraint("parsed_from", "external_id", name="uix_job_source"),
        Index("idx_jobs_status", "status"),
        Index("idx_jobs_published", "published_at"),
        {"extend_existing": True},
    )

    # Basic info (bilingual)
    title_ge = Column(String(500), nullable=False)
    title_en = Column(String(500), nullable=True)
    body_ge = Column(Text, nullable=False)
    body_en = Column(Text, nullable=True)

    # Company (denormalized name for quick display)
    company_id = Column(UUID(as_uuid=True), nullable=True)
    company_name = Column(String(255), nullable=True)

    # Location
    location = Column(String(255), nullable=True)
    region_id = Column(UUID(as_uuid=True), nullable=True)
    remote_type = Column(String(20), default="onsite", nullable=False)

    # Category
    category_id = Column(UUID(as_uuid=True), nullable=True)

    # Employment details
    employment_type = Column(String(20), default="full_time", nullable=False)
    experience_level = Column(String(20), nullable=True)

    # Salary information
    has_salary = Column(Boolean, default=False, nullable=False)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String(3), default="GEL", nullable=False)
    salary_period = Column(String(20), default="monthly", nullable=False)

    # Dates
    published_at = Column(DateTime(timezone=True), nullable=True)
    deadline_at = Column(DateTime(timezone=True), nullable=True)

    # Status and flags
    status = Column(String(20), default="active", nullable=False, index=True)
    is_vip = Column(Boolean, default=False, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)

    # Source tracking
    parsed_from = Column(String(100), default="manual", nullable=False)
    external_id = Column(String(255), nullable=True)
    source_url = Column(Text, nullable=True)
    content_hash = Column(String(64), nullable=True)

    # Timestamps for parser tracking
    first_seen_at = Column(DateTime(timezone=True), nullable=True)
    last_seen_at = Column(DateTime(timezone=True), nullable=True)

    # jobs.ge original filter values (for tracking source categorization)
    jobsge_cid = Column(Integer, nullable=True)  # Original jobs.ge category ID
    jobsge_lid = Column(Integer, nullable=True)  # Original jobs.ge location ID
