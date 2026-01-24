from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc, or_

from app.database import get_db
from app.models import Job, Company
from app.schemas.job import JobResponse, JobDetail, JobListResponse, PaginationMeta

router = APIRouter()


@router.get("", response_model=JobListResponse)
def list_jobs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    company_id: Optional[int] = None,
    is_expired: Optional[bool] = None,
    is_work_from_home: Optional[bool] = None,
    is_suitable_for_student: Optional[bool] = None,
    salary_min: Optional[int] = None,
    salary_max: Optional[int] = None,
    location: Optional[str] = None,
    sort_by: str = Query("publish_date", pattern="^(publish_date|deadline_date|salary_from|created_at)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """List jobs with pagination and filters."""
    query = select(Job)

    # Apply filters
    if search:
        search_filter = or_(
            Job.title.ilike(f"%{search}%"),
            Job.title_en.ilike(f"%{search}%"),
            Job.description.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)

    if company_id is not None:
        query = query.where(Job.company_id == company_id)

    if is_expired is not None:
        query = query.where(Job.is_expired == is_expired)

    if is_work_from_home is not None:
        query = query.where(Job.is_work_from_home == is_work_from_home)

    if is_suitable_for_student is not None:
        query = query.where(Job.is_suitable_for_student == is_suitable_for_student)

    if salary_min is not None:
        query = query.where(Job.salary_from >= salary_min)

    if salary_max is not None:
        query = query.where(Job.salary_to <= salary_max)

    if location:
        # Search in JSONB addresses array
        query = query.where(Job.addresses.contains([location]))

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar()

    # Apply sorting
    sort_column = getattr(Job, sort_by)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)

    # Apply pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)

    # Execute query
    jobs = db.execute(query).scalars().all()

    # Calculate total pages
    total_pages = (total + per_page - 1) // per_page if total else 0

    return JobListResponse(
        data=jobs,
        meta=PaginationMeta(
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        ),
    )


@router.get("/latest", response_model=List[JobResponse])
def get_latest_jobs(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Get latest jobs."""
    query = (
        select(Job)
        .where(Job.is_expired == False)
        .order_by(desc(Job.publish_date))
        .limit(limit)
    )
    jobs = db.execute(query).scalars().all()
    return jobs


@router.get("/search", response_model=JobListResponse)
def search_jobs(
    q: str = Query(..., min_length=2),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search jobs by keyword."""
    search_filter = or_(
        Job.title.ilike(f"%{q}%"),
        Job.title_en.ilike(f"%{q}%"),
        Job.description.ilike(f"%{q}%"),
    )

    query = select(Job).where(search_filter).order_by(desc(Job.publish_date))

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar()

    # Apply pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)

    jobs = db.execute(query).scalars().all()

    total_pages = (total + per_page - 1) // per_page if total else 0

    return JobListResponse(
        data=jobs,
        meta=PaginationMeta(
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        ),
    )


@router.get("/{job_id}", response_model=JobDetail)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get job by ID."""
    job = db.execute(select(Job).where(Job.id == job_id)).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/external/{external_id}", response_model=JobDetail)
def get_job_by_external_id(external_id: int, db: Session = Depends(get_db)):
    """Get job by external HR.ge ID."""
    job = db.execute(
        select(Job).where(Job.external_id == external_id)
    ).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
