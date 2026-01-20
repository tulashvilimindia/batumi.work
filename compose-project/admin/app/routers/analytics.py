"""Analytics router - job market analytics."""
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter()


@router.get("/overview")
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    """Get analytics overview."""
    # Total jobs
    result = await db.execute(text("SELECT COUNT(*) FROM jobs"))
    total_jobs = result.scalar() or 0

    # Active jobs
    result = await db.execute(text("SELECT COUNT(*) FROM jobs WHERE status = 'active'"))
    active_jobs = result.scalar() or 0

    # Jobs with salary
    result = await db.execute(text("SELECT COUNT(*) FROM jobs WHERE has_salary = true"))
    with_salary = result.scalar() or 0

    # VIP jobs
    result = await db.execute(text("SELECT COUNT(*) FROM jobs WHERE is_vip = true"))
    vip_jobs = result.scalar() or 0

    # Jobs by status
    result = await db.execute(text("""
        SELECT status, COUNT(*) as count
        FROM jobs
        GROUP BY status
    """))
    by_status = {row[0]: row[1] for row in result.fetchall()}

    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "with_salary": with_salary,
        "vip_jobs": vip_jobs,
        "by_status": by_status,
    }


@router.get("/salary")
async def get_salary_analytics(db: AsyncSession = Depends(get_db)):
    """Get salary distribution analytics."""
    # Average salary
    result = await db.execute(text("""
        SELECT
            AVG(salary_min) as avg_min,
            AVG(salary_max) as avg_max,
            MIN(salary_min) as min_salary,
            MAX(salary_max) as max_salary
        FROM jobs
        WHERE has_salary = true AND salary_min > 0
    """))
    row = result.fetchone()

    # Salary by category
    result = await db.execute(text("""
        SELECT
            c.name_en,
            c.name_ge,
            AVG(j.salary_min) as avg_min,
            AVG(j.salary_max) as avg_max,
            COUNT(*) as count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        WHERE j.has_salary = true AND j.salary_min > 0
        GROUP BY c.id, c.name_en, c.name_ge
        ORDER BY avg_max DESC
    """))
    by_category = [
        {
            "name_en": r[0],
            "name_ge": r[1],
            "avg_min": round(r[2], 0) if r[2] else 0,
            "avg_max": round(r[3], 0) if r[3] else 0,
            "count": r[4]
        }
        for r in result.fetchall()
    ]

    # Salary distribution (ranges)
    result = await db.execute(text("""
        SELECT
            CASE
                WHEN salary_max < 500 THEN '< 500'
                WHEN salary_max < 1000 THEN '500-1000'
                WHEN salary_max < 2000 THEN '1000-2000'
                WHEN salary_max < 3000 THEN '2000-3000'
                WHEN salary_max < 5000 THEN '3000-5000'
                ELSE '5000+'
            END as range,
            COUNT(*) as count
        FROM jobs
        WHERE has_salary = true AND salary_max > 0
        GROUP BY range
        ORDER BY MIN(salary_max)
    """))
    distribution = [{"range": r[0], "count": r[1]} for r in result.fetchall()]

    return {
        "average": {
            "min": round(row[0], 0) if row[0] else 0,
            "max": round(row[1], 0) if row[1] else 0,
        },
        "range": {
            "min": row[2] if row[2] else 0,
            "max": row[3] if row[3] else 0,
        },
        "by_category": by_category,
        "distribution": distribution,
    }


@router.get("/trends")
async def get_job_trends(db: AsyncSession = Depends(get_db)):
    """Get job posting trends."""
    # Jobs by day (last 30 days)
    result = await db.execute(text("""
        SELECT
            DATE(created_at) as date,
            COUNT(*) as count
        FROM jobs
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
    """))
    by_day = [
        {"date": str(r[0]), "count": r[1]}
        for r in result.fetchall()
    ]

    # Top companies
    result = await db.execute(text("""
        SELECT company_name, COUNT(*) as count
        FROM jobs
        WHERE company_name IS NOT NULL AND company_name != ''
        GROUP BY company_name
        ORDER BY count DESC
        LIMIT 10
    """))
    top_companies = [
        {"company": r[0], "count": r[1]}
        for r in result.fetchall()
    ]

    return {
        "by_day": by_day,
        "top_companies": top_companies,
    }
