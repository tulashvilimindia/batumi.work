from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.database import get_db
from app.models import Company, Job
from app.schemas.company import CompanyResponse, CompanyListResponse, PaginationMeta
from app.schemas.job import JobResponse, JobListResponse
from app.schemas.job import PaginationMeta as JobPaginationMeta

router = APIRouter()


@router.get("", response_model=CompanyListResponse)
def list_companies(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List companies with pagination."""
    query = select(Company)

    if search:
        query = query.where(
            Company.name.ilike(f"%{search}%") | Company.name_en.ilike(f"%{search}%")
        )

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar()

    # Apply pagination and ordering
    offset = (page - 1) * per_page
    query = query.order_by(Company.name).offset(offset).limit(per_page)

    companies = db.execute(query).scalars().all()

    # Add job count to each company
    company_responses = []
    for company in companies:
        job_count = db.execute(
            select(func.count()).where(Job.company_id == company.id)
        ).scalar()
        company_data = CompanyResponse.model_validate(company)
        company_data.job_count = job_count
        company_responses.append(company_data)

    total_pages = (total + per_page - 1) // per_page if total else 0

    return CompanyListResponse(
        data=company_responses,
        meta=PaginationMeta(
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        ),
    )


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(company_id: int, db: Session = Depends(get_db)):
    """Get company by ID."""
    company = db.execute(
        select(Company).where(Company.id == company_id)
    ).scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    job_count = db.execute(
        select(func.count()).where(Job.company_id == company.id)
    ).scalar()

    response = CompanyResponse.model_validate(company)
    response.job_count = job_count
    return response


@router.get("/external/{external_id}", response_model=CompanyResponse)
def get_company_by_external_id(external_id: int, db: Session = Depends(get_db)):
    """Get company by external HR.ge ID."""
    company = db.execute(
        select(Company).where(Company.external_id == external_id)
    ).scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    job_count = db.execute(
        select(func.count()).where(Job.company_id == company.id)
    ).scalar()

    response = CompanyResponse.model_validate(company)
    response.job_count = job_count
    return response


@router.get("/{company_id}/jobs", response_model=JobListResponse)
def get_company_jobs(
    company_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    is_expired: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """Get jobs for a specific company."""
    # Verify company exists
    company = db.execute(
        select(Company).where(Company.id == company_id)
    ).scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    query = select(Job).where(Job.company_id == company_id)

    if is_expired is not None:
        query = query.where(Job.is_expired == is_expired)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar()

    # Apply pagination and ordering
    offset = (page - 1) * per_page
    query = query.order_by(desc(Job.publish_date)).offset(offset).limit(per_page)

    jobs = db.execute(query).scalars().all()

    total_pages = (total + per_page - 1) // per_page if total else 0

    return JobListResponse(
        data=jobs,
        meta=JobPaginationMeta(
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        ),
    )
