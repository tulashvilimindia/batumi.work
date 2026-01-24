import asyncio
from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.database import get_db
from app.models import ParserRun
from app.parser.scraper import run_parser
from app.parser.scheduler import get_scheduler_status
from app.schemas.stats import ParserRunResponse, ParserStatusResponse

router = APIRouter()


def run_parser_task(run_type: str = "full"):
    """Run parser in background."""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        asyncio.run(run_parser(db, run_type=run_type))
    finally:
        db.close()


@router.post("/run")
def trigger_parser(
    background_tasks: BackgroundTasks,
    run_type: str = Query("full", pattern="^(full|incremental)$"),
):
    """Trigger a manual parser run."""
    background_tasks.add_task(run_parser_task, run_type)
    return {
        "message": f"Parser {run_type} run started",
        "status": "started",
    }


@router.get("/status", response_model=ParserStatusResponse)
def get_parser_status(db: Session = Depends(get_db)):
    """Get current parser status."""
    scheduler_status = get_scheduler_status()

    # Get last run
    last_run = db.execute(
        select(ParserRun)
        .order_by(desc(ParserRun.started_at))
        .limit(1)
    ).scalar_one_or_none()

    last_run_response = None
    if last_run:
        last_run_response = ParserRunResponse(
            id=last_run.id,
            started_at=last_run.started_at,
            finished_at=last_run.finished_at,
            status=last_run.status,
            jobs_found=last_run.jobs_found,
            jobs_created=last_run.jobs_created,
            jobs_updated=last_run.jobs_updated,
            jobs_failed=last_run.jobs_failed,
            error_message=last_run.error_message,
            run_type=last_run.run_type,
        )

    return ParserStatusResponse(
        scheduler_running=scheduler_status.get("running", False),
        next_run_time=scheduler_status.get("next_run_time"),
        interval_hours=scheduler_status.get("interval_hours", 6),
        last_run=last_run_response,
    )


@router.get("/history", response_model=List[ParserRunResponse])
def get_parser_history(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Get parser run history."""
    runs = db.execute(
        select(ParserRun)
        .order_by(desc(ParserRun.started_at))
        .limit(limit)
    ).scalars().all()

    return [
        ParserRunResponse(
            id=run.id,
            started_at=run.started_at,
            finished_at=run.finished_at,
            status=run.status,
            jobs_found=run.jobs_found,
            jobs_created=run.jobs_created,
            jobs_updated=run.jobs_updated,
            jobs_failed=run.jobs_failed,
            error_message=run.error_message,
            run_type=run.run_type,
        )
        for run in runs
    ]
