"""Pydantic schemas for Admin API."""
from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str
    timestamp: datetime


class QueueStats(BaseModel):
    """Queue statistics."""
    pending: int
    processing: int
    sent: int
    failed: int
    cancelled: int
    total: int


class RateLimits(BaseModel):
    """Rate limit status."""
    messages_sent_this_minute: int
    max_per_minute: int
    messages_sent_this_hour: int
    max_per_hour: int
    message_delay_seconds: float
    can_send_now: bool


class BusinessHoursStatus(BaseModel):
    """Business hours status."""
    current_time_georgia: str
    is_business_hours: bool
    business_hours: str
    next_open: Optional[str]
    time_until_open_seconds: Optional[int]


class StatusResponse(BaseModel):
    """Full status response."""
    paused: bool
    queue: QueueStats
    rate_limits: RateLimits
    business_hours: BusinessHoursStatus


class QueueItemResponse(BaseModel):
    """Queue item response."""
    id: UUID
    job_id: UUID
    status: str
    priority: int
    scheduled_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HistoryItemResponse(BaseModel):
    """History item response."""
    id: UUID
    job_id: UUID
    queue_id: Optional[UUID]
    telegram_message_id: Optional[int]
    status: str
    message_text: Optional[str]
    error_message: Optional[str]
    retry_count: int
    sent_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryStats(BaseModel):
    """History statistics."""
    sent: int
    failed: int
    deleted: int
    total: int


class ActionResponse(BaseModel):
    """Generic action response."""
    success: bool
    message: str


class RetryAllResponse(BaseModel):
    """Response for retry all failed."""
    success: bool
    retried_count: int
    message: str
