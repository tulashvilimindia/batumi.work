"""Admin endpoints for parser management."""
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import verify_api_key
from app.models.parser_run import ParserRun
from app.schemas.parser_run import (
    ParserRunResponse,
    ParserTriggerRequest,
    ParserTriggerResponse,
    ParserSourceStatus,
)
from app.schemas.base import PaginatedResponse

router = APIRouter(
    prefix="/parser",
    tags=["Admin - Parser"],
    dependencies=[Depends(verify_api_key)],
)


@router.get("/runs", response_model=PaginatedResponse)
async def list_parser_runs(
    source: Optional[str] = Query(None, description="Filter by source"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List parser run history with pagination."""
    query = select(ParserRun)

    # Apply filters
    if source:
        query = query.where(ParserRun.source == source)
    if status:
        query = query.where(ParserRun.status == status)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Order by most recent
    query = query.order_by(desc(ParserRun.started_at))

    # Paginate
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    runs = result.scalars().all()

    pages = (total + page_size - 1) // page_size

    return PaginatedResponse(
        items=[ParserRunResponse.model_validate(run) for run in runs],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/runs/{run_id}", response_model=ParserRunResponse)
async def get_parser_run(
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get details of a specific parser run."""
    query = select(ParserRun).where(ParserRun.id == run_id)
    result = await db.execute(query)
    run = result.scalar_one_or_none()

    if not run:
        raise HTTPException(status_code=404, detail="Parser run not found")

    return ParserRunResponse.model_validate(run)


@router.get("/sources", response_model=List[ParserSourceStatus])
async def list_parser_sources(
    db: AsyncSession = Depends(get_db),
):
    """List all parser sources with their status."""
    # Get unique sources
    sources_query = select(ParserRun.source).distinct()
    sources_result = await db.execute(sources_query)
    sources = [row[0] for row in sources_result.all()]

    # Known sources (even if not run yet)
    known_sources = {"jobs.ge", "hr.ge"}
    all_sources = set(sources) | known_sources

    statuses = []
    for source in sorted(all_sources):
        # Get last run
        last_run_query = (
            select(ParserRun)
            .where(ParserRun.source == source)
            .order_by(desc(ParserRun.started_at))
            .limit(1)
        )
        last_run_result = await db.execute(last_run_query)
        last_run = last_run_result.scalar_one_or_none()

        # Get last successful run
        last_success_query = (
            select(ParserRun)
            .where(ParserRun.source == source, ParserRun.status == "completed")
            .order_by(desc(ParserRun.started_at))
            .limit(1)
        )
        last_success_result = await db.execute(last_success_query)
        last_success = last_success_result.scalar_one_or_none()

        # Get total runs and success rate
        total_query = (
            select(func.count())
            .select_from(ParserRun)
            .where(ParserRun.source == source)
        )
        total_result = await db.execute(total_query)
        total_runs = total_result.scalar_one()

        success_query = (
            select(func.count())
            .select_from(ParserRun)
            .where(ParserRun.source == source, ParserRun.status == "completed")
        )
        success_result = await db.execute(success_query)
        success_count = success_result.scalar_one()

        success_rate = success_count / total_runs if total_runs > 0 else 0.0

        statuses.append(
            ParserSourceStatus(
                source=source,
                enabled=source in {"jobs.ge"},  # TODO: Get from config
                last_run=ParserRunResponse.model_validate(last_run) if last_run else None,
                last_successful_run=(
                    ParserRunResponse.model_validate(last_success) if last_success else None
                ),
                total_runs=total_runs,
                success_rate=success_rate,
            )
        )

    return statuses


@router.post("/trigger", response_model=ParserTriggerResponse)
async def trigger_parser(
    request: ParserTriggerRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger a parser run.

    This starts the parser in the background and returns immediately.
    Use GET /parser/runs/{run_id} to check status.
    """
    # Create run record
    run = ParserRun(
        source=request.source,
        regions=request.regions,
        status="pending",
        triggered_by="api",
        started_at=datetime.now(timezone.utc),
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)

    # TODO: Trigger actual parser run via message queue or HTTP call to worker
    # For now, we just create the record and let the worker poll for pending runs

    return ParserTriggerResponse(
        run_id=run.id,
        message=f"Parser run scheduled for {request.source}",
        source=request.source,
        regions=request.regions,
    )


@router.delete("/runs/{run_id}")
async def cancel_parser_run(
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Cancel a running parser run."""
    query = select(ParserRun).where(ParserRun.id == run_id)
    result = await db.execute(query)
    run = result.scalar_one_or_none()

    if not run:
        raise HTTPException(status_code=404, detail="Parser run not found")

    if run.status not in ("running", "pending"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel run with status '{run.status}'",
        )

    run.status = "cancelled"
    run.finished_at = datetime.now(timezone.utc)
    if run.started_at:
        run.duration_seconds = int(
            (run.finished_at - run.started_at).total_seconds()
        )

    await db.commit()

    return {"message": "Parser run cancelled", "run_id": str(run_id)}
