"""Job model - the core entity of the job board."""
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Job(Base, UUIDMixin, TimestampMixin):
    """Job posting model with bilingual support."""

    __tablename__ = "jobs"
    __table_args__ = (
        UniqueConstraint("parsed_from", "external_id", name="uix_job_source"),
        Index("idx_jobs_status", "status"),
        Index("idx_jobs_category", "category_id"),
        Index("idx_jobs_region", "region_id"),
        Index("idx_jobs_company", "company_id"),
        Index("idx_jobs_published", "published_at"),
        Index("idx_jobs_has_salary", "has_salary", postgresql_where="has_salary = true"),
    )

    # Basic info (bilingual)
    title_ge = Column(String(500), nullable=False)
    title_en = Column(String(500), nullable=True)
    body_ge = Column(Text, nullable=False)
    body_en = Column(Text, nullable=True)

    # Company (foreign key and denormalized name for quick display)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True)
    company_name = Column(String(255), nullable=True)  # Denormalized

    # Location
    location = Column(String(255), nullable=True)
    region_id = Column(UUID(as_uuid=True), ForeignKey("regions.id"), nullable=True)
    remote_type = Column(
        String(20), default="onsite", nullable=False
    )  # onsite, remote, hybrid

    # Category
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)

    # Employment details
    employment_type = Column(
        String(20), default="full_time", nullable=False
    )  # full_time, part_time, contract, internship, freelance
    experience_level = Column(
        String(20), nullable=True
    )  # entry, mid, senior, executive, any

    # Salary information
    has_salary = Column(Boolean, default=False, nullable=False)
    salary_min = Column(Integer, nullable=True)  # In GEL
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String(3), default="GEL", nullable=False)  # GEL, USD, EUR
    salary_period = Column(
        String(20), default="monthly", nullable=False
    )  # hourly, daily, monthly, yearly

    # Dates
    published_at = Column(DateTime(timezone=True), nullable=True)
    deadline_at = Column(DateTime(timezone=True), nullable=True)

    # Status and flags
    status = Column(
        String(20), default="active", nullable=False, index=True
    )  # active, inactive, expired, pending_review
    is_vip = Column(Boolean, default=False, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)

    # Source tracking (for parser/aggregation)
    parsed_from = Column(
        String(100), default="manual", nullable=False
    )  # manual, jobs.ge, hr.ge, etc.
    external_id = Column(String(255), nullable=True)  # ID from source site
    source_url = Column(Text, nullable=True)  # Original job posting URL
    content_hash = Column(String(64), nullable=True)  # For detecting changes

    # Timestamps for parser tracking
    first_seen_at = Column(DateTime(timezone=True), nullable=True)
    last_seen_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    category = relationship("Category", back_populates="jobs")
    region = relationship("Region", back_populates="jobs")
    company = relationship("Company", back_populates="jobs")

    def __repr__(self):
        return f"<Job(id={self.id}, title_ge={self.title_ge[:50] if self.title_ge else None}, status={self.status})>"
