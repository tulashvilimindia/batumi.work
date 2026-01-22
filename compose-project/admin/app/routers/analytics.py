"""Analytics router - job market analytics."""
from datetime import date, datetime, timedelta
from typing import Optional
from io import StringIO
import csv

from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter()


# ============================================================================
# Pydantic Models for Dashboard V2
# ============================================================================

class DashboardFilters(BaseModel):
    """Filter parameters for dashboard queries."""
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    categories: Optional[list[str]] = None  # category slugs
    regions: Optional[list[str]] = None  # region slugs or lids
    employment_types: Optional[list[str]] = None
    remote_types: Optional[list[str]] = None
    has_salary: Optional[bool] = None
    is_vip: Optional[bool] = None
    source: Optional[str] = None


class SummaryStats(BaseModel):
    total_jobs: int
    active_jobs: int
    new_in_period: int
    with_salary: int
    vip_jobs: int
    avg_salary_min: Optional[float] = None
    avg_salary_max: Optional[float] = None


class TimeSeriesPoint(BaseModel):
    date: str
    count: int


class BreakdownItem(BaseModel):
    name: str
    name_ge: Optional[str] = None
    slug: Optional[str] = None
    count: int
    percentage: float


class SalaryHistogramBin(BaseModel):
    range: str
    min_val: int
    max_val: int
    count: int


class SalaryCategoryItem(BaseModel):
    name: str
    avg_min: float
    avg_max: float
    count: int


class DashboardV2Response(BaseModel):
    summary: SummaryStats
    time_series: list[TimeSeriesPoint]
    by_category: list[BreakdownItem]
    by_region: list[BreakdownItem]
    by_employment: list[BreakdownItem]
    by_remote: list[BreakdownItem]
    salary_histogram: list[SalaryHistogramBin]
    salary_by_category: list[SalaryCategoryItem]


class FilterOption(BaseModel):
    value: str
    label: str
    label_ge: Optional[str] = None
    count: int


class FiltersResponse(BaseModel):
    categories: list[FilterOption]
    regions: list[FilterOption]
    employment_types: list[FilterOption]
    remote_types: list[FilterOption]
    sources: list[FilterOption]
    date_range: dict  # min_date, max_date


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


# ============================================================================
# Dashboard V2 - Filter-Driven Analytics
# ============================================================================

def build_filter_clause(
    date_from: Optional[date],
    date_to: Optional[date],
    categories: Optional[list[str]],
    regions: Optional[list[str]],
    employment_types: Optional[list[str]],
    remote_types: Optional[list[str]],
    has_salary: Optional[bool],
    is_vip: Optional[bool],
    source: Optional[str],
) -> tuple[str, dict]:
    """Build SQL WHERE clause and params from filters."""
    conditions = ["1=1"]
    params = {}

    if date_from:
        conditions.append("j.created_at >= :date_from")
        params["date_from"] = datetime.combine(date_from, datetime.min.time())
    if date_to:
        conditions.append("j.created_at <= :date_to")
        params["date_to"] = datetime.combine(date_to, datetime.max.time())
    if categories:
        conditions.append("c.slug = ANY(:categories)")
        params["categories"] = categories
    if regions:
        # Support both slugs and lid numbers
        conditions.append("(r.slug = ANY(:regions) OR CAST(j.jobsge_lid AS TEXT) = ANY(:regions))")
        params["regions"] = regions
    if employment_types:
        conditions.append("j.employment_type = ANY(:employment_types)")
        params["employment_types"] = employment_types
    if remote_types:
        conditions.append("j.remote_type = ANY(:remote_types)")
        params["remote_types"] = remote_types
    if has_salary is not None:
        conditions.append("j.has_salary = :has_salary")
        params["has_salary"] = has_salary
    if is_vip is not None:
        conditions.append("j.is_vip = :is_vip")
        params["is_vip"] = is_vip
    if source:
        conditions.append("j.parsed_from = :source")
        params["source"] = source

    return " AND ".join(conditions), params


@router.get("/dashboard-v2")
async def get_dashboard_v2(
    db: AsyncSession = Depends(get_db),
    date_from: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    categories: Optional[str] = Query(None, description="Comma-separated category slugs"),
    regions: Optional[str] = Query(None, description="Comma-separated region slugs or lids"),
    employment_types: Optional[str] = Query(None, description="Comma-separated employment types"),
    remote_types: Optional[str] = Query(None, description="Comma-separated: onsite,remote,hybrid"),
    has_salary: Optional[bool] = Query(None, description="Filter by has_salary"),
    is_vip: Optional[bool] = Query(None, description="Filter by is_vip"),
    source: Optional[str] = Query(None, description="Filter by source (e.g., jobs.ge)"),
):
    """
    Get comprehensive dashboard analytics with filter support.

    Supports filtering by date range, categories, regions, employment type, etc.
    Returns summary stats, time series, and breakdowns.
    """
    # Parse comma-separated values
    cat_list = [c.strip() for c in categories.split(",")] if categories else None
    reg_list = [r.strip() for r in regions.split(",")] if regions else None
    emp_list = [e.strip() for e in employment_types.split(",")] if employment_types else None
    rem_list = [r.strip() for r in remote_types.split(",")] if remote_types else None

    # Build filter clause
    where_clause, params = build_filter_clause(
        date_from, date_to, cat_list, reg_list, emp_list, rem_list,
        has_salary, is_vip, source
    )

    # Default date range to last 30 days if not specified
    if not date_from and not date_to:
        default_from = datetime.now() - timedelta(days=30)
        params["period_start"] = default_from
    else:
        params["period_start"] = datetime.combine(date_from, datetime.min.time()) if date_from else datetime.now() - timedelta(days=30)

    # ========== Summary Stats ==========
    summary_query = f"""
        SELECT
            COUNT(*) as total_jobs,
            COUNT(*) FILTER (WHERE j.status = 'active') as active_jobs,
            COUNT(*) FILTER (WHERE j.created_at >= :period_start) as new_in_period,
            COUNT(*) FILTER (WHERE j.has_salary = true) as with_salary,
            COUNT(*) FILTER (WHERE j.is_vip = true) as vip_jobs,
            AVG(j.salary_min) FILTER (WHERE j.has_salary = true AND j.salary_min > 0) as avg_salary_min,
            AVG(j.salary_max) FILTER (WHERE j.has_salary = true AND j.salary_max > 0) as avg_salary_max
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN regions r ON j.region_id = r.id
        WHERE {where_clause}
    """
    result = await db.execute(text(summary_query), params)
    row = result.fetchone()
    summary = {
        "total_jobs": row[0] or 0,
        "active_jobs": row[1] or 0,
        "new_in_period": row[2] or 0,
        "with_salary": row[3] or 0,
        "vip_jobs": row[4] or 0,
        "avg_salary_min": round(row[5], 0) if row[5] else None,
        "avg_salary_max": round(row[6], 0) if row[6] else None,
    }

    # ========== Time Series (jobs posted by day) ==========
    time_series_query = f"""
        SELECT DATE(j.created_at) as date, COUNT(*) as count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN regions r ON j.region_id = r.id
        WHERE {where_clause}
        GROUP BY DATE(j.created_at)
        ORDER BY date
    """
    result = await db.execute(text(time_series_query), params)
    time_series = [{"date": str(r[0]), "count": r[1]} for r in result.fetchall()]

    # ========== Category Breakdown ==========
    total_for_pct = summary["total_jobs"] or 1
    category_query = f"""
        SELECT
            COALESCE(c.name_en, c.name_ge, 'Unknown') as name,
            c.name_ge,
            c.slug,
            COUNT(*) as count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN regions r ON j.region_id = r.id
        WHERE {where_clause}
        GROUP BY c.id, c.name_en, c.name_ge, c.slug
        ORDER BY count DESC
    """
    result = await db.execute(text(category_query), params)
    by_category = [
        {
            "name": r[0],
            "name_ge": r[1],
            "slug": r[2],
            "count": r[3],
            "percentage": round((r[3] / total_for_pct) * 100, 1)
        }
        for r in result.fetchall()
    ]

    # ========== Region Breakdown ==========
    region_query = f"""
        SELECT
            COALESCE(r.name_en, r.name_ge, 'Unknown') as name,
            r.name_ge,
            r.slug,
            COUNT(*) as count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN regions r ON j.region_id = r.id
        WHERE {where_clause}
        GROUP BY r.id, r.name_en, r.name_ge, r.slug
        ORDER BY count DESC
    """
    result = await db.execute(text(region_query), params)
    by_region = [
        {
            "name": r[0],
            "name_ge": r[1],
            "slug": r[2],
            "count": r[3],
            "percentage": round((r[3] / total_for_pct) * 100, 1)
        }
        for r in result.fetchall()
    ]

    # ========== Employment Type Breakdown ==========
    employment_query = f"""
        SELECT
            COALESCE(j.employment_type, 'unspecified') as name,
            COUNT(*) as count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN regions r ON j.region_id = r.id
        WHERE {where_clause}
        GROUP BY j.employment_type
        ORDER BY count DESC
    """
    result = await db.execute(text(employment_query), params)
    by_employment = [
        {
            "name": r[0],
            "name_ge": None,
            "slug": r[0],
            "count": r[1],
            "percentage": round((r[1] / total_for_pct) * 100, 1)
        }
        for r in result.fetchall()
    ]

    # ========== Remote Type Breakdown ==========
    remote_query = f"""
        SELECT
            COALESCE(j.remote_type, 'unspecified') as name,
            COUNT(*) as count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN regions r ON j.region_id = r.id
        WHERE {where_clause}
        GROUP BY j.remote_type
        ORDER BY count DESC
    """
    result = await db.execute(text(remote_query), params)
    by_remote = [
        {
            "name": r[0],
            "name_ge": None,
            "slug": r[0],
            "count": r[1],
            "percentage": round((r[1] / total_for_pct) * 100, 1)
        }
        for r in result.fetchall()
    ]

    # ========== Salary Histogram ==========
    salary_hist_query = f"""
        SELECT
            CASE
                WHEN j.salary_max < 500 THEN '< 500'
                WHEN j.salary_max < 1000 THEN '500-1000'
                WHEN j.salary_max < 1500 THEN '1000-1500'
                WHEN j.salary_max < 2000 THEN '1500-2000'
                WHEN j.salary_max < 3000 THEN '2000-3000'
                WHEN j.salary_max < 5000 THEN '3000-5000'
                ELSE '5000+'
            END as range,
            CASE
                WHEN j.salary_max < 500 THEN 0
                WHEN j.salary_max < 1000 THEN 500
                WHEN j.salary_max < 1500 THEN 1000
                WHEN j.salary_max < 2000 THEN 1500
                WHEN j.salary_max < 3000 THEN 2000
                WHEN j.salary_max < 5000 THEN 3000
                ELSE 5000
            END as min_val,
            CASE
                WHEN j.salary_max < 500 THEN 500
                WHEN j.salary_max < 1000 THEN 1000
                WHEN j.salary_max < 1500 THEN 1500
                WHEN j.salary_max < 2000 THEN 2000
                WHEN j.salary_max < 3000 THEN 3000
                WHEN j.salary_max < 5000 THEN 5000
                ELSE 99999
            END as max_val,
            COUNT(*) as count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN regions r ON j.region_id = r.id
        WHERE {where_clause} AND j.has_salary = true AND j.salary_max > 0
        GROUP BY range, min_val, max_val
        ORDER BY min_val
    """
    result = await db.execute(text(salary_hist_query), params)
    salary_histogram = [
        {"range": r[0], "min_val": r[1], "max_val": r[2], "count": r[3]}
        for r in result.fetchall()
    ]

    # ========== Salary by Category ==========
    salary_cat_query = f"""
        SELECT
            COALESCE(c.name_en, c.name_ge, 'Unknown') as name,
            AVG(j.salary_min) as avg_min,
            AVG(j.salary_max) as avg_max,
            COUNT(*) as count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN regions r ON j.region_id = r.id
        WHERE {where_clause} AND j.has_salary = true AND j.salary_min > 0
        GROUP BY c.id, c.name_en, c.name_ge
        HAVING COUNT(*) >= 2
        ORDER BY avg_max DESC
        LIMIT 10
    """
    result = await db.execute(text(salary_cat_query), params)
    salary_by_category = [
        {
            "name": r[0],
            "avg_min": round(r[1], 0) if r[1] else 0,
            "avg_max": round(r[2], 0) if r[2] else 0,
            "count": r[3]
        }
        for r in result.fetchall()
    ]

    return {
        "summary": summary,
        "time_series": time_series,
        "by_category": by_category,
        "by_region": by_region,
        "by_employment": by_employment,
        "by_remote": by_remote,
        "salary_histogram": salary_histogram,
        "salary_by_category": salary_by_category,
    }


@router.get("/filters")
async def get_filter_options(db: AsyncSession = Depends(get_db)):
    """
    Get available filter options with counts.

    Returns all categories, regions, employment types, etc. with job counts.
    """
    # Categories
    result = await db.execute(text("""
        SELECT c.slug, c.name_en, c.name_ge, COUNT(j.id) as count
        FROM categories c
        LEFT JOIN jobs j ON j.category_id = c.id
        GROUP BY c.id, c.slug, c.name_en, c.name_ge
        ORDER BY count DESC
    """))
    categories = [
        {"value": r[0], "label": r[1] or r[2], "label_ge": r[2], "count": r[3]}
        for r in result.fetchall()
    ]

    # Regions
    result = await db.execute(text("""
        SELECT r.slug, r.name_en, r.name_ge, COUNT(j.id) as count
        FROM regions r
        LEFT JOIN jobs j ON j.region_id = r.id
        GROUP BY r.id, r.slug, r.name_en, r.name_ge
        ORDER BY count DESC
    """))
    regions = [
        {"value": r[0], "label": r[1] or r[2], "label_ge": r[2], "count": r[3]}
        for r in result.fetchall()
    ]

    # Employment types
    result = await db.execute(text("""
        SELECT
            COALESCE(employment_type, 'unspecified') as type,
            COUNT(*) as count
        FROM jobs
        GROUP BY employment_type
        ORDER BY count DESC
    """))
    employment_types = [
        {"value": r[0], "label": r[0].replace("_", " ").title(), "label_ge": None, "count": r[1]}
        for r in result.fetchall()
    ]

    # Remote types
    result = await db.execute(text("""
        SELECT
            COALESCE(remote_type, 'unspecified') as type,
            COUNT(*) as count
        FROM jobs
        GROUP BY remote_type
        ORDER BY count DESC
    """))
    remote_types = [
        {"value": r[0], "label": r[0].replace("_", " ").title(), "label_ge": None, "count": r[1]}
        for r in result.fetchall()
    ]

    # Sources
    result = await db.execute(text("""
        SELECT
            COALESCE(parsed_from, 'unknown') as source,
            COUNT(*) as count
        FROM jobs
        GROUP BY parsed_from
        ORDER BY count DESC
    """))
    sources = [
        {"value": r[0], "label": r[0], "label_ge": None, "count": r[1]}
        for r in result.fetchall()
    ]

    # Date range
    result = await db.execute(text("""
        SELECT MIN(created_at), MAX(created_at) FROM jobs
    """))
    row = result.fetchone()
    date_range = {
        "min_date": str(row[0].date()) if row[0] else None,
        "max_date": str(row[1].date()) if row[1] else None,
    }

    return {
        "categories": categories,
        "regions": regions,
        "employment_types": employment_types,
        "remote_types": remote_types,
        "sources": sources,
        "date_range": date_range,
    }


@router.get("/export")
async def export_analytics(
    db: AsyncSession = Depends(get_db),
    format: str = Query("csv", description="Export format: csv"),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    categories: Optional[str] = Query(None),
    regions: Optional[str] = Query(None),
):
    """
    Export filtered job data as CSV.
    """
    # Parse filters
    cat_list = [c.strip() for c in categories.split(",")] if categories else None
    reg_list = [r.strip() for r in regions.split(",")] if regions else None

    where_clause, params = build_filter_clause(
        date_from, date_to, cat_list, reg_list, None, None, None, None, None
    )

    query = f"""
        SELECT
            j.external_id,
            j.title_en,
            j.title_ge,
            j.company_name,
            COALESCE(c.name_en, c.name_ge) as category,
            COALESCE(r.name_en, r.name_ge) as region,
            j.location,
            j.salary_min,
            j.salary_max,
            j.has_salary,
            j.is_vip,
            j.employment_type,
            j.remote_type,
            j.status,
            j.created_at,
            j.published_at,
            j.deadline_at
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN regions r ON j.region_id = r.id
        WHERE {where_clause}
        ORDER BY j.created_at DESC
        LIMIT 10000
    """
    result = await db.execute(text(query), params)
    rows = result.fetchall()

    # Generate CSV
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "external_id", "title_en", "title_ge", "company", "category", "region",
        "location", "salary_min", "salary_max", "has_salary", "is_vip",
        "employment_type", "remote_type", "status", "created_at", "published_at", "deadline_at"
    ])
    for row in rows:
        writer.writerow([
            row[0], row[1], row[2], row[3], row[4], row[5], row[6],
            row[7], row[8], row[9], row[10], row[11], row[12], row[13],
            str(row[14]) if row[14] else "",
            str(row[15]) if row[15] else "",
            str(row[16]) if row[16] else "",
        ])

    output.seek(0)
    filename = f"jobs_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
