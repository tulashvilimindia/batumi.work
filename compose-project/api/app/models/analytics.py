"""Analytics models for tracking job views and searches."""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, BigInteger, String, Integer, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.models.base import Base


class JobView(Base):
    """Model for tracking job views."""
    __tablename__ = "job_views"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Session tracking
    session_id = Column(String(64), nullable=True, index=True)
    user_agent = Column(Text, nullable=True)
    ip_hash = Column(String(64), nullable=True)  # SHA-256 hashed for privacy

    # Source tracking
    referrer = Column(String(500), nullable=True)
    utm_source = Column(String(100), nullable=True)
    utm_medium = Column(String(100), nullable=True)
    utm_campaign = Column(String(100), nullable=True)

    # Device info
    device_type = Column(String(20), nullable=True)  # mobile, tablet, desktop
    browser = Column(String(50), nullable=True)
    os = Column(String(50), nullable=True)

    # Location (from IP geolocation)
    country_code = Column(String(2), nullable=True)
    city = Column(String(100), nullable=True)

    # Language
    language = Column(String(2), nullable=True)  # ge, en


class SearchAnalytics(Base):
    """Model for tracking search analytics."""
    __tablename__ = "search_analytics"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    searched_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Query info
    query = Column(String(255), nullable=True)
    query_normalized = Column(String(255), nullable=True, index=True)  # lowercase, trimmed

    # Filters used
    category_id = Column(UUID(as_uuid=True), nullable=True)
    region_id = Column(UUID(as_uuid=True), nullable=True)
    has_salary_filter = Column(Boolean, nullable=True)
    is_vip_filter = Column(Boolean, nullable=True)
    filters_json = Column(JSON, nullable=True)

    # Results
    results_count = Column(Integer, nullable=True)
    results_shown = Column(Integer, nullable=True)

    # User action
    clicked_job_id = Column(UUID(as_uuid=True), nullable=True)
    time_to_click_ms = Column(Integer, nullable=True)

    # Session
    session_id = Column(String(64), nullable=True, index=True)
    language = Column(String(2), nullable=True)
