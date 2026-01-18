"""Admin analytics API endpoints."""
from datetime import datetime, date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from uuid import UUID
import hashlib

from app.core.database import get_db
from app.core.security import verify_api_key
from app.models.analytics import JobView, SearchAnalytics
from app.models.job import Job
from app.models.category import Category
from app.models.region import Region
from app.models.parser_run import ParserRun
from app.schemas.analytics import (
    DashboardResponse, SummaryStats, TrendStats, CategoryStat, RegionStat,
    SalaryInsights, ParserHealth, ParserSourceHealth,
    JobMarketResponse, SearchAnalyticsResponse, ViewsAnalyticsResponse,
    TrackEventRequest
)

router = APIRouter(prefix="/admin/analytics", tags=["Admin Analytics"])


def get_date_range(days: int = 7):
    """Get date range for queries."""
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    prev_start = start_date - timedelta(days=days)
    return start_date, end_date, prev_start


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    days: int = Query(7, ge=1, le=90, description="Number of days for period"),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(verify_api_key)
):
    """Get main analytics dashboard data."""
    start_date, end_date, prev_start = get_date_range(days)

    # Get job counts
    jobs_query = select(
        func.count(Job.id).label('total'),
        func.count(Job.id).filter(Job.status == 'active').label('active'),
        func.count(Job.id).filter(Job.created_at >= start_date).label('new_period'),
        func.count(Job.id).filter(Job.has_salary == True).label('with_salary'),
    )
    jobs_result = await db.execute(jobs_query)
    jobs_stats = jobs_result.one()

    # Get previous period job count for trend
    prev_jobs_query = select(func.count(Job.id)).where(
        Job.created_at >= prev_start,
        Job.created_at < start_date
    )
    prev_jobs_result = await db.execute(prev_jobs_query)
    prev_jobs_count = prev_jobs_result.scalar() or 0

    # Get view counts
    views_query = select(
        func.count(JobView.id).label('total'),
        func.count(func.distinct(JobView.session_id)).label('unique'),
    ).where(JobView.viewed_at >= start_date)
    views_result = await db.execute(views_query)
    views_stats = views_result.one()

    # Get previous period views for trend
    prev_views_query = select(func.count(JobView.id)).where(
        JobView.viewed_at >= prev_start,
        JobView.viewed_at < start_date
    )
    prev_views_result = await db.execute(prev_views_query)
    prev_views_count = prev_views_result.scalar() or 0

    # Get search counts
    searches_query = select(func.count(SearchAnalytics.id)).where(
        SearchAnalytics.searched_at >= start_date
    )
    searches_result = await db.execute(searches_query)
    searches_count = searches_result.scalar() or 0

    # Get previous period searches for trend
    prev_searches_query = select(func.count(SearchAnalytics.id)).where(
        SearchAnalytics.searched_at >= prev_start,
        SearchAnalytics.searched_at < start_date
    )
    prev_searches_result = await db.execute(prev_searches_query)
    prev_searches_count = prev_searches_result.scalar() or 0

    # Calculate trends
    def calc_trend(current: int, previous: int) -> float:
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 1)

    # Get top categories
    cat_query = select(
        Category.slug,
        Category.name_ge,
        func.count(Job.id).label('jobs'),
    ).outerjoin(Job, (Job.category_id == Category.id) & (Job.status == 'active')).group_by(
        Category.id
    ).order_by(text('jobs DESC')).limit(5)
    cat_result = await db.execute(cat_query)
    top_categories = [
        CategoryStat(slug=row.slug, name=row.name_ge, jobs=row.jobs or 0, views=0)
        for row in cat_result.all()
    ]

    # Get top regions
    total_active_jobs = jobs_stats.active or 1
    region_query = select(
        Region.slug,
        Region.name_ge,
        func.count(Job.id).label('jobs'),
    ).outerjoin(Job, (Job.region_id == Region.id) & (Job.status == 'active')).group_by(
        Region.id
    ).order_by(text('jobs DESC')).limit(5)
    region_result = await db.execute(region_query)
    top_regions = [
        RegionStat(
            slug=row.slug,
            name=row.name_ge,
            jobs=row.jobs or 0,
            pct=round((row.jobs or 0) / total_active_jobs * 100, 1)
        )
        for row in region_result.all()
    ]

    # Get parser health
    parser_query = select(ParserRun).where(
        ParserRun.started_at >= datetime.now() - timedelta(hours=24)
    ).order_by(ParserRun.started_at.desc())
    parser_result = await db.execute(parser_query)
    parser_runs = parser_result.scalars().all()

    sources_health = {}
    for run in parser_runs:
        if run.source not in sources_health:
            sources_health[run.source] = {
                'name': run.source,
                'status': 'healthy' if run.status == 'completed' else 'warning',
                'last_run': run.started_at,
                'jobs_today': run.new_jobs or 0,
                'success_count': 1 if run.status == 'completed' else 0,
                'total_count': 1
            }
        else:
            sources_health[run.source]['total_count'] += 1
            if run.status == 'completed':
                sources_health[run.source]['success_count'] += 1
            sources_health[run.source]['jobs_today'] += run.new_jobs or 0

    parser_sources = [
        ParserSourceHealth(
            name=v['name'],
            status=v['status'],
            last_run=v['last_run'],
            jobs_today=v['jobs_today']
        )
        for v in sources_health.values()
    ]

    total_runs = sum(v['total_count'] for v in sources_health.values())
    success_runs = sum(v['success_count'] for v in sources_health.values())
    success_rate = round(success_runs / total_runs * 100, 1) if total_runs > 0 else 100.0

    return DashboardResponse(
        period={"from": str(start_date), "to": str(end_date)},
        summary=SummaryStats(
            total_jobs=jobs_stats.total or 0,
            active_jobs=jobs_stats.active or 0,
            new_jobs_period=jobs_stats.new_period or 0,
            total_views=views_stats.total or 0,
            unique_visitors=views_stats.unique or 0,
            searches=searches_count,
            avg_jobs_per_day=round((jobs_stats.new_period or 0) / days, 1)
        ),
        trends=TrendStats(
            jobs_change_pct=calc_trend(jobs_stats.new_period or 0, prev_jobs_count),
            views_change_pct=calc_trend(views_stats.total or 0, prev_views_count),
            searches_change_pct=calc_trend(searches_count, prev_searches_count)
        ),
        top_categories=top_categories,
        top_regions=top_regions,
        salary_insights=SalaryInsights(
            jobs_with_salary_pct=round((jobs_stats.with_salary or 0) / (jobs_stats.active or 1) * 100, 1),
            avg_salary_min=0,
            avg_salary_max=0,
            currency="GEL"
        ),
        parser_health=ParserHealth(
            sources=parser_sources or [ParserSourceHealth(name="jobs.ge", status="pending", last_run=None, jobs_today=0)],
            success_rate_24h=success_rate
        )
    )


@router.get("/jobs")
async def get_job_analytics(
    days: int = Query(30, ge=1, le=365),
    category: Optional[str] = None,
    region: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(verify_api_key)
):
    """Get job market analytics."""
    start_date = date.today() - timedelta(days=days)

    # Basic query for jobs
    query = select(
        func.date(Job.created_at).label('date'),
        func.count(Job.id).label('count')
    ).where(Job.created_at >= start_date)

    if category:
        cat_query = select(Category.id).where(Category.slug == category)
        cat_result = await db.execute(cat_query)
        cat_id = cat_result.scalar()
        if cat_id:
            query = query.where(Job.category_id == cat_id)

    if region:
        reg_query = select(Region.id).where(Region.slug == region)
        reg_result = await db.execute(reg_query)
        reg_id = reg_result.scalar()
        if reg_id:
            query = query.where(Job.region_id == reg_id)

    query = query.group_by(func.date(Job.created_at)).order_by(func.date(Job.created_at))
    result = await db.execute(query)
    jobs_by_day = [{"date": str(row.date), "count": row.count} for row in result.all()]

    return {
        "period": {"from": str(start_date), "to": str(date.today())},
        "jobs_by_day": jobs_by_day
    }


@router.get("/views")
async def get_views_analytics(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(verify_api_key)
):
    """Get views analytics."""
    start_date = date.today() - timedelta(days=days)

    # Views by day
    query = select(
        func.date(JobView.viewed_at).label('date'),
        func.count(JobView.id).label('total'),
        func.count(func.distinct(JobView.session_id)).label('unique')
    ).where(JobView.viewed_at >= start_date).group_by(
        func.date(JobView.viewed_at)
    ).order_by(func.date(JobView.viewed_at))

    result = await db.execute(query)
    views_by_day = [
        {"date": str(row.date), "total": row.total, "unique": row.unique}
        for row in result.all()
    ]

    # Device breakdown
    device_query = select(
        JobView.device_type,
        func.count(JobView.id).label('count')
    ).where(
        JobView.viewed_at >= start_date,
        JobView.device_type.isnot(None)
    ).group_by(JobView.device_type)

    device_result = await db.execute(device_query)
    device_breakdown = {row.device_type: row.count for row in device_result.all()}

    return {
        "period": {"from": str(start_date), "to": str(date.today())},
        "views_by_day": views_by_day,
        "device_breakdown": device_breakdown
    }


@router.get("/searches")
async def get_search_analytics(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(verify_api_key)
):
    """Get search analytics."""
    start_date = date.today() - timedelta(days=days)

    # Total searches
    total_query = select(func.count(SearchAnalytics.id)).where(
        SearchAnalytics.searched_at >= start_date
    )
    total_result = await db.execute(total_query)
    total_searches = total_result.scalar() or 0

    # Top queries
    top_query = select(
        SearchAnalytics.query_normalized,
        func.count(SearchAnalytics.id).label('count'),
        func.avg(SearchAnalytics.results_count).label('avg_results'),
        func.count(SearchAnalytics.clicked_job_id).label('clicks')
    ).where(
        SearchAnalytics.searched_at >= start_date,
        SearchAnalytics.query_normalized.isnot(None)
    ).group_by(SearchAnalytics.query_normalized).order_by(
        text('count DESC')
    ).limit(20)

    top_result = await db.execute(top_query)
    top_queries = [
        {
            "query": row.query_normalized,
            "count": row.count,
            "avg_results": round(row.avg_results or 0, 1),
            "click_rate": round(row.clicks / row.count * 100, 1) if row.count > 0 else 0
        }
        for row in top_result.all()
    ]

    # Zero result queries
    zero_query = select(SearchAnalytics.query_normalized).where(
        SearchAnalytics.searched_at >= start_date,
        SearchAnalytics.results_count == 0,
        SearchAnalytics.query_normalized.isnot(None)
    ).distinct().limit(20)

    zero_result = await db.execute(zero_query)
    zero_result_queries = [row.query_normalized for row in zero_result.all()]

    return {
        "period": {"from": str(start_date), "to": str(date.today())},
        "total_searches": total_searches,
        "top_queries": top_queries,
        "zero_result_queries": zero_result_queries
    }


# --- Public tracking endpoint ---

public_router = APIRouter(prefix="/analytics", tags=["Analytics Tracking"])


@public_router.post("/track")
async def track_event(
    event: TrackEventRequest,
    db: AsyncSession = Depends(get_db)
):
    """Track an analytics event from the frontend."""
    try:
        if event.event == "job_view" and event.job_id:
            # Track job view
            view = JobView(
                job_id=event.job_id,
                session_id=event.session_id,
                referrer=event.referrer,
                language=event.language
            )
            db.add(view)
            await db.commit()

        elif event.event == "search":
            # Track search
            query_normalized = event.query.lower().strip() if event.query else None
            search = SearchAnalytics(
                query=event.query,
                query_normalized=query_normalized,
                results_count=event.results_count,
                session_id=event.session_id,
                language=event.language,
                filters_json=event.filters
            )
            db.add(search)
            await db.commit()

        elif event.event == "job_click" and event.job_id:
            # Update last search with clicked job
            query = select(SearchAnalytics).where(
                SearchAnalytics.session_id == event.session_id,
                SearchAnalytics.clicked_job_id.is_(None)
            ).order_by(SearchAnalytics.searched_at.desc()).limit(1)

            result = await db.execute(query)
            search = result.scalar_one_or_none()
            if search:
                search.clicked_job_id = event.job_id
                await db.commit()

        return {"status": "ok"}

    except Exception as e:
        # Don't fail on tracking errors
        return {"status": "error", "message": str(e)}
