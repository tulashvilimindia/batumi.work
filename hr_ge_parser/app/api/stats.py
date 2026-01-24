from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.database import get_db
from app.models import Job, Company, ParserRun
from app.schemas.stats import StatsResponse, LocationStats, IndustryStats, SalaryStats

router = APIRouter()


@router.get("", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """Get platform statistics."""
    total_jobs = db.execute(select(func.count(Job.id))).scalar()
    active_jobs = db.execute(
        select(func.count(Job.id)).where(Job.is_expired == False)
    ).scalar()
    expired_jobs = db.execute(
        select(func.count(Job.id)).where(Job.is_expired == True)
    ).scalar()
    total_companies = db.execute(select(func.count(Company.id))).scalar()
    remote_jobs = db.execute(
        select(func.count(Job.id)).where(Job.is_work_from_home == True)
    ).scalar()
    student_jobs = db.execute(
        select(func.count(Job.id)).where(Job.is_suitable_for_student == True)
    ).scalar()
    jobs_with_salary = db.execute(
        select(func.count(Job.id)).where(Job.salary_from.isnot(None))
    ).scalar()

    # Get last updated time
    last_run = db.execute(
        select(ParserRun)
        .where(ParserRun.status == "completed")
        .order_by(ParserRun.finished_at.desc())
        .limit(1)
    ).scalar_one_or_none()

    return StatsResponse(
        total_jobs=total_jobs or 0,
        active_jobs=active_jobs or 0,
        expired_jobs=expired_jobs or 0,
        total_companies=total_companies or 0,
        remote_jobs=remote_jobs or 0,
        student_jobs=student_jobs or 0,
        jobs_with_salary=jobs_with_salary or 0,
        last_updated=last_run.finished_at if last_run else None,
    )


@router.get("/by-location", response_model=List[LocationStats])
def get_stats_by_location(
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """Get job counts by location."""
    # This is a simplified version - for full functionality,
    # would need to unnest the JSONB addresses array
    jobs = db.execute(
        select(Job.addresses).where(Job.addresses.isnot(None))
    ).scalars().all()

    location_counts = {}
    for addresses in jobs:
        if addresses:
            for addr in addresses:
                location_counts[addr] = location_counts.get(addr, 0) + 1

    # Sort and limit
    sorted_locations = sorted(
        location_counts.items(), key=lambda x: x[1], reverse=True
    )[:limit]

    return [
        LocationStats(location=loc, count=count)
        for loc, count in sorted_locations
    ]


@router.get("/by-industry", response_model=List[IndustryStats])
def get_stats_by_industry(
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """Get job counts by industry (from company industry)."""
    from app.models import Industry

    results = db.execute(
        select(Industry.name, func.count(Job.id))
        .join(Company, Company.industry_id == Industry.id)
        .join(Job, Job.company_id == Company.id)
        .group_by(Industry.id, Industry.name)
        .order_by(func.count(Job.id).desc())
        .limit(limit)
    ).all()

    return [
        IndustryStats(industry=name, count=count)
        for name, count in results
    ]


@router.get("/salary", response_model=SalaryStats)
def get_salary_stats(db: Session = Depends(get_db)):
    """Get salary statistics."""
    jobs_with_salary = db.execute(
        select(func.count(Job.id)).where(Job.salary_from.isnot(None))
    ).scalar()

    avg_from = db.execute(
        select(func.avg(Job.salary_from)).where(Job.salary_from.isnot(None))
    ).scalar()

    avg_to = db.execute(
        select(func.avg(Job.salary_to)).where(Job.salary_to.isnot(None))
    ).scalar()

    min_salary = db.execute(
        select(func.min(Job.salary_from)).where(Job.salary_from.isnot(None))
    ).scalar()

    max_salary = db.execute(
        select(func.max(Job.salary_to)).where(Job.salary_to.isnot(None))
    ).scalar()

    return SalaryStats(
        avg_salary_from=round(avg_from, 2) if avg_from else None,
        avg_salary_to=round(avg_to, 2) if avg_to else None,
        min_salary=min_salary,
        max_salary=max_salary,
        jobs_with_salary=jobs_with_salary or 0,
    )
