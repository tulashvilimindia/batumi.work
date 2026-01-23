"""Admin API routes for Channel Sender Service."""
from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.services.queue_service import QueueService
from app.services.sender_service import SenderService, HistoryService
from app.tasks.queue_processor import (
    get_queue_status,
    pause_sender,
    resume_sender,
    is_sender_paused,
)
from app.api.schemas import (
    HealthResponse,
    StatusResponse,
    QueueItemResponse,
    HistoryItemResponse,
    HistoryStats,
    ActionResponse,
    RetryAllResponse,
)

router = APIRouter(prefix="/sender", tags=["sender"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        timestamp=datetime.now(timezone.utc),
    )


@router.get("/status", response_model=StatusResponse)
async def get_status():
    """Get comprehensive sender status."""
    status = await get_queue_status()
    return StatusResponse(**status)


@router.get("/queue", response_model=List[QueueItemResponse])
async def list_queue(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List pending queue items."""
    queue_service = QueueService(db)
    items = await queue_service.get_all_pending(offset=offset, limit=limit)
    return [QueueItemResponse.model_validate(item) for item in items]


@router.get("/queue/failed", response_model=List[QueueItemResponse])
async def list_failed(
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List failed queue items."""
    queue_service = QueueService(db)
    items = await queue_service.get_failed_items(limit=limit)
    return [QueueItemResponse.model_validate(item) for item in items]


@router.get("/history", response_model=List[HistoryItemResponse])
async def list_history(
    status: Optional[str] = Query(None, description="Filter by status: sent, failed, deleted"),
    job_id: Optional[UUID] = Query(None, description="Filter by job ID"),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List message history."""
    history_service = HistoryService(db)
    items = await history_service.get_history(
        status=status,
        job_id=job_id,
        offset=offset,
        limit=limit,
    )
    return [HistoryItemResponse.model_validate(item) for item in items]


@router.get("/history/stats", response_model=HistoryStats)
async def get_history_stats(db: AsyncSession = Depends(get_db)):
    """Get history statistics."""
    history_service = HistoryService(db)
    stats = await history_service.get_history_stats()
    return HistoryStats(**stats)


@router.post("/retry/{queue_id}", response_model=ActionResponse)
async def retry_message(
    queue_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retry a failed message."""
    queue_service = QueueService(db)
    success = await queue_service.retry_failed(queue_id)
    await db.commit()

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Queue item not found or not in failed status",
        )

    return ActionResponse(
        success=True,
        message=f"Queue item {queue_id} reset to pending for retry",
    )


@router.post("/retry-all-failed", response_model=RetryAllResponse)
async def retry_all_failed(db: AsyncSession = Depends(get_db)):
    """Retry all failed messages."""
    queue_service = QueueService(db)
    count = await queue_service.retry_all_failed()
    await db.commit()

    return RetryAllResponse(
        success=True,
        retried_count=count,
        message=f"Reset {count} failed items to pending status",
    )


@router.delete("/queue/{queue_id}", response_model=ActionResponse)
async def cancel_queue_item(
    queue_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Cancel a pending queue item."""
    queue_service = QueueService(db)
    success = await queue_service.cancel_queue_item(queue_id)
    await db.commit()

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Queue item not found or not in pending status",
        )

    return ActionResponse(
        success=True,
        message=f"Queue item {queue_id} cancelled",
    )


@router.post("/pause", response_model=ActionResponse)
async def pause_sending():
    """Pause message sending."""
    pause_sender()
    return ActionResponse(
        success=True,
        message="Sender paused. No new messages will be sent until resumed.",
    )


@router.post("/resume", response_model=ActionResponse)
async def resume_sending():
    """Resume message sending."""
    resume_sender()
    return ActionResponse(
        success=True,
        message="Sender resumed. Message sending will continue.",
    )


@router.get("/paused", response_model=dict)
async def get_pause_status():
    """Get current pause status."""
    return {"paused": is_sender_paused()}
