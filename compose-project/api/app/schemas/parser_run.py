"""Pydantic schemas for parser runs."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ParserRunBase(BaseModel):
    """Base parser run schema."""

    source: str = Field(..., description="Source identifier (e.g., 'jobs.ge')")
    regions: List[str] = Field(default_factory=list, description="Regions parsed")


class ParserRunCreate(ParserRunBase):
    """Schema for creating a parser run."""

    triggered_by: str = Field(default="api", description="Who triggered the run")


class ParserRunStats(BaseModel):
    """Statistics for a parser run."""

    total_found: int = 0
    new_jobs: int = 0
    updated_jobs: int = 0
    skipped_jobs: int = 0
    failed_jobs: int = 0
    pages_parsed: int = 0
    error_count: int = 0


class ParserRunUpdate(BaseModel):
    """Schema for updating a parser run."""

    status: Optional[str] = None
    finished_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    total_found: Optional[int] = None
    new_jobs: Optional[int] = None
    updated_jobs: Optional[int] = None
    skipped_jobs: Optional[int] = None
    failed_jobs: Optional[int] = None
    pages_parsed: Optional[int] = None
    error_count: Optional[int] = None
    error_samples: Optional[List[str]] = None
    error_message: Optional[str] = None


class ParserRunResponse(ParserRunBase):
    """Schema for parser run response."""

    id: UUID
    started_at: datetime
    finished_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    status: str
    total_found: int = 0
    new_jobs: int = 0
    updated_jobs: int = 0
    skipped_jobs: int = 0
    failed_jobs: int = 0
    pages_parsed: int = 0
    error_count: int = 0
    error_samples: List[str] = []
    error_message: Optional[str] = None
    triggered_by: str = "scheduler"

    class Config:
        from_attributes = True


class ParserTriggerRequest(BaseModel):
    """Request to trigger a parser run."""

    source: str = Field(..., description="Source to parse (e.g., 'jobs.ge')")
    regions: List[str] = Field(
        default_factory=lambda: ["batumi", "tbilisi"],
        description="Regions to parse",
    )


class ParserTriggerResponse(BaseModel):
    """Response from triggering a parser."""

    run_id: UUID
    message: str
    source: str
    regions: List[str]


class ParserSourceStatus(BaseModel):
    """Status of a parser source."""

    source: str
    enabled: bool
    last_run: Optional[ParserRunResponse] = None
    last_successful_run: Optional[ParserRunResponse] = None
    total_runs: int = 0
    success_rate: float = 0.0
