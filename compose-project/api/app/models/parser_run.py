"""Parser run model for tracking parsing operations."""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, Integer, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.database import Base


class ParserRun(Base):
    """Model for tracking parser run history."""

    __tablename__ = "parser_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Source identification
    source = Column(String(100), nullable=False, index=True)  # e.g., "jobs.ge"
    regions = Column(JSON, default=list)  # Regions parsed in this run

    # Timing
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    # Status
    status = Column(String(20), nullable=False, default="running", index=True)
    # Status values: running, completed, failed, cancelled

    # Statistics
    total_found = Column(Integer, default=0)
    new_jobs = Column(Integer, default=0)
    updated_jobs = Column(Integer, default=0)
    skipped_jobs = Column(Integer, default=0)
    failed_jobs = Column(Integer, default=0)
    pages_parsed = Column(Integer, default=0)

    # Errors
    error_count = Column(Integer, default=0)
    error_samples = Column(JSON, default=list)  # First N errors
    error_message = Column(Text, nullable=True)  # Fatal error message

    # Metadata
    triggered_by = Column(String(50), default="scheduler")  # scheduler, manual, api

    def __repr__(self):
        return f"<ParserRun {self.id} source={self.source} status={self.status}>"
