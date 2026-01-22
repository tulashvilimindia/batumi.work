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


@router.get("/dashboard")
async def get_dashboard_analytics(db: AsyncSession = Depends(get_db)):
    """Get combined dashboard analytics for the admin panel."""
    # Summary stats
    result = await db.execute(text("SELECT COUNT(*) FROM jobs WHERE status = 'active'"))
    active_jobs = result.scalar() or 0

    result = await db.execute(text("SELECT COUNT(*) FROM jobs WHERE has_salary = true"))
    with_salary = result.scalar() or 0

    result = await db.execute(text("SELECT COUNT(*) FROM jobs WHERE is_vip = true"))
    vip_jobs = result.scalar() or 0

    # Top categories
    result = await db.execute(text("""
        SELECT COALESCE(c.name_en, c.name_ge, 'Unknown') as name, COUNT(*) as jobs
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        WHERE j.status = 'active'
        GROUP BY c.id, c.name_en, c.name_ge
        ORDER BY jobs DESC
        LIMIT 8
    """))
    top_categories = [{"name": r[0], "jobs": r[1]} for r in result.fetchall()]

    # Top regions
    result = await db.execute(text("""
        SELECT COALESCE(r.name_en, r.name_ge, 'Unknown') as name, COUNT(*) as jobs
        FROM jobs j
        LEFT JOIN regions r ON j.region_id = r.id
        WHERE j.status = 'active'
        GROUP BY r.id, r.name_en, r.name_ge
        ORDER BY jobs DESC
        LIMIT 6
    """))
    top_regions = [{"name": r[0], "jobs": r[1]} for r in result.fetchall()]

    # Parser health - check parse_jobs table
    result = await db.execute(text("""
        SELECT
            'jobs.ge' as name,
            CASE
                WHEN MAX(completed_at) > NOW() - INTERVAL '1 hour' THEN 'healthy'
                WHEN MAX(completed_at) > NOW() - INTERVAL '24 hours' THEN 'warning'
                ELSE 'error'
            END as status,
            MAX(completed_at) as last_run,
            COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as jobs_today
        FROM parse_jobs
    """))
    row = result.fetchone()
    parser_sources = [{
        "name": row[0],
        "status": row[1] if row[1] else "pending",
        "last_run": row[2].isoformat() if row[2] else None,
        "jobs_today": row[3] or 0
    }] if row else [{"name": "jobs.ge", "status": "pending", "last_run": None, "jobs_today": 0}]

    return {
        "summary": {
            "active_jobs": active_jobs,
            "total_views": 0,  # Not tracked yet
            "unique_visitors": 0,  # Not tracked yet
            "searches": 0,  # Not tracked yet
        },
        "trends": {
            "jobs_change_pct": 0,  # Would need historical data
            "views_change_pct": 0,
            "searches_change_pct": 0,
        },
        "top_categories": top_categories,
        "top_regions": top_regions,
        "parser_health": {
            "sources": parser_sources
        }
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
