"""Public jobs API endpoints."""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.job_service import JobService
from app.schemas.job import (
    JobResponse,
    JobListItem,
    JobSearchParams,
)
from app.schemas.base import PaginatedResponse

router = APIRouter()


@router.get(
    "",
    response_model=PaginatedResponse[JobListItem],
    summary="List jobs",
    description="Get paginated list of jobs with optional filters. Supports jobs.ge style filters (cid/lid).",
)
async def list_jobs(
    q: Optional[str] = Query(None, description="Search in title/company"),
    category: Optional[str] = Query(None, description="Category slug"),
    cid: Optional[int] = Query(None, description="jobs.ge category ID (1-18)"),
    region: Optional[str] = Query(None, description="Region slug"),
    lid: Optional[int] = Query(None, description="jobs.ge location/region ID"),
    location: Optional[str] = Query(None, description="Location text filter (e.g., აჭარა)"),
    has_salary: Optional[bool] = Query(None, description="Filter jobs with salary"),
    is_vip: Optional[bool] = Query(None, description="Filter VIP jobs"),
    status: Optional[str] = Query("active", description="Job status"),
    employment_type: Optional[str] = Query(None, description="Employment type"),
    remote_type: Optional[str] = Query(None, description="Remote type"),
    sort: Optional[str] = Query("-external_id", description="Sort field (default: -external_id, same as jobs.ge)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
):
    """List jobs with pagination and filters.

    Supports two filter styles:
    - Slug-based: category=it-programming, region=adjara
    - jobs.ge style: cid=6 (IT), lid=14 (Adjara)
    """
    params = JobSearchParams(
        q=q,
        category=category,
        cid=cid,
        region=region,
        lid=lid,
        location=location,
        has_salary=has_salary,
        is_vip=is_vip,
        status=status,
        employment_type=employment_type,
        remote_type=remote_type,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    service = JobService(db)
    return await service.list_jobs(params)


@router.get(
    "/{job_id}",
    response_model=JobResponse,
    summary="Get job detail",
    description="Get detailed information about a specific job. Accepts UUID or numeric external_id.",
)
async def get_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single job by ID (UUID) or external_id (numeric)."""
    service = JobService(db)

    # Try to parse as UUID first
    try:
        uuid_id = UUID(job_id)
        job = await service.get_job(uuid_id)
    except ValueError:
        # Not a UUID, try as external_id (numeric)
        job = await service.get_job_by_external_id(job_id)

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    return job
