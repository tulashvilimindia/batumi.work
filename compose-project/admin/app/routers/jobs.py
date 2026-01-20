"""Jobs router - CRUD operations."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.database import get_db

router = APIRouter()


@router.get("")
async def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
    q: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List jobs with pagination and filters."""
    # Build query
    where_clauses = []
    params = {}

    if status:
        where_clauses.append("j.status = :status")
        params["status"] = status

    if category:
        where_clauses.append("c.slug = :category")
        params["category"] = category

    if region:
        where_clauses.append("r.slug = :region")
        params["region"] = region

    if q:
        where_clauses.append("(j.title_ge ILIKE :q OR j.company_name ILIKE :q)")
        params["q"] = f"%{q}%"

    where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"

    # Count total
    count_sql = f"""
        SELECT COUNT(*) FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN regions r ON j.region_id = r.id
        WHERE {where_sql}
    """
    result = await db.execute(text(count_sql), params)
    total = result.scalar()

    # Get jobs
    offset = (page - 1) * page_size
    params["limit"] = page_size
    params["offset"] = offset

    query_sql = f"""
        SELECT j.id, j.title_ge, j.title_en, j.company_name, j.location, j.status,
               c.name_en as category_name, r.name_en as region_name,
               j.has_salary, j.salary_min, j.salary_max,
               j.published_at, j.created_at, j.parsed_from
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN regions r ON j.region_id = r.id
        WHERE {where_sql}
        ORDER BY j.created_at DESC
        LIMIT :limit OFFSET :offset
    """
    result = await db.execute(text(query_sql), params)
    rows = result.fetchall()

    jobs = [
        {
            "id": str(row[0]),
            "title_ge": row[1],
            "title_en": row[2],
            "company_name": row[3],
            "location": row[4],
            "status": row[5],
            "category": row[6],
            "region": row[7],
            "has_salary": row[8],
            "salary_min": row[9],
            "salary_max": row[10],
            "published_at": row[11].isoformat() if row[11] else None,
            "created_at": row[12].isoformat() if row[12] else None,
            "parsed_from": row[13],
        }
        for row in rows
    ]

    return {
        "items": jobs,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size if total else 0,
    }


@router.get("/{job_id}")
async def get_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get a single job by ID."""
    result = await db.execute(
        text("SELECT * FROM jobs WHERE id = :id"),
        {"id": str(job_id)}
    )
    row = result.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Job not found")

    # Convert row to dict
    columns = result.keys()
    job = dict(zip(columns, row))

    # Convert UUID and datetime fields
    job["id"] = str(job["id"])
    if job.get("category_id"):
        job["category_id"] = str(job["category_id"])
    if job.get("region_id"):
        job["region_id"] = str(job["region_id"])

    for key in ["published_at", "deadline_at", "created_at", "updated_at", "first_seen_at", "last_seen_at"]:
        if job.get(key):
            job[key] = job[key].isoformat()

    return job


@router.patch("/{job_id}/status")
async def update_job_status(
    job_id: UUID,
    status: str = Query(..., regex="^(active|inactive|expired)$"),
    db: AsyncSession = Depends(get_db),
):
    """Update job status."""
    result = await db.execute(
        text("UPDATE jobs SET status = :status, updated_at = NOW() WHERE id = :id RETURNING id"),
        {"id": str(job_id), "status": status}
    )
    row = result.fetchone()
    await db.commit()

    if not row:
        raise HTTPException(status_code=404, detail="Job not found")

    return {"id": str(job_id), "status": status, "updated": True}


@router.delete("/{job_id}")
async def delete_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    """Delete a job."""
    result = await db.execute(
        text("DELETE FROM jobs WHERE id = :id RETURNING id"),
        {"id": str(job_id)}
    )
    row = result.fetchone()
    await db.commit()

    if not row:
        raise HTTPException(status_code=404, detail="Job not found")

    return {"id": str(job_id), "deleted": True}
