"""Scheduled analytics tasks for the worker."""
import structlog
from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import os

logger = structlog.get_logger()


async def get_db_session():
    """Create a database session for analytics tasks."""
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@db:5432/jobboard"
    )
    engine = create_async_engine(database_url)
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    return async_session()


async def refresh_materialized_views():
    """Refresh all analytics materialized views.

    This should be run periodically (e.g., every 4 hours or daily at 4 AM)
    to keep analytics data up-to-date without impacting query performance.
    """
    views = [
        'mv_daily_job_stats',
        'mv_daily_views',
        'mv_category_stats',
        'mv_search_trends'
    ]

    logger.info("analytics_refresh_started", views=views)

    async with await get_db_session() as session:
        refreshed = []
        errors = []

        for view in views:
            try:
                # CONCURRENTLY allows the view to be queried during refresh
                # (requires a unique index on the view)
                await session.execute(text(
                    f"REFRESH MATERIALIZED VIEW CONCURRENTLY {view}"
                ))
                refreshed.append(view)
                logger.debug("view_refreshed", view=view)
            except Exception as e:
                # If CONCURRENTLY fails, try without it
                try:
                    await session.execute(text(
                        f"REFRESH MATERIALIZED VIEW {view}"
                    ))
                    refreshed.append(view)
                    logger.debug("view_refreshed_non_concurrent", view=view)
                except Exception as e2:
                    errors.append({"view": view, "error": str(e2)})
                    logger.warning("view_refresh_failed", view=view, error=str(e2))

        await session.commit()

    logger.info(
        "analytics_refresh_completed",
        refreshed=len(refreshed),
        errors=len(errors),
        views=refreshed
    )

    return {"refreshed": refreshed, "errors": errors}


async def cleanup_old_analytics(retention_days: int = 90):
    """Remove analytics data older than retention period.

    Args:
        retention_days: Days to retain data (default: 90)

    This helps keep the database size manageable and complies
    with data retention policies.
    """
    cutoff = datetime.utcnow() - timedelta(days=retention_days)

    logger.info("analytics_cleanup_started", retention_days=retention_days, cutoff=cutoff.isoformat())

    async with await get_db_session() as session:
        stats = {}

        # Delete old job views
        result = await session.execute(text(
            "DELETE FROM job_views WHERE viewed_at < :cutoff"
        ), {"cutoff": cutoff})
        stats["views_deleted"] = result.rowcount

        # Delete old search analytics
        result = await session.execute(text(
            "DELETE FROM search_analytics WHERE searched_at < :cutoff"
        ), {"cutoff": cutoff})
        stats["searches_deleted"] = result.rowcount

        await session.commit()

    logger.info("analytics_cleanup_completed", **stats)

    return stats


async def generate_daily_summary():
    """Generate a summary of daily analytics.

    This can be used for logging, monitoring, or sending reports.
    """
    async with await get_db_session() as session:
        # Get yesterday's stats
        yesterday = datetime.utcnow().date() - timedelta(days=1)

        # Job stats
        result = await session.execute(text("""
            SELECT
                COUNT(*) as total_jobs,
                COUNT(*) FILTER (WHERE status = 'active') as active_jobs,
                COUNT(*) FILTER (WHERE DATE(created_at) = :date) as new_jobs
            FROM jobs
        """), {"date": yesterday})
        job_stats = result.one()._asdict()

        # View stats
        result = await session.execute(text("""
            SELECT
                COUNT(*) as total_views,
                COUNT(DISTINCT session_id) as unique_visitors,
                COUNT(DISTINCT job_id) as jobs_viewed
            FROM job_views
            WHERE DATE(viewed_at) = :date
        """), {"date": yesterday})
        view_stats = result.one()._asdict()

        # Search stats
        result = await session.execute(text("""
            SELECT
                COUNT(*) as total_searches,
                COUNT(DISTINCT session_id) as unique_searchers,
                ROUND(AVG(results_count)::numeric, 2) as avg_results
            FROM search_analytics
            WHERE DATE(searched_at) = :date
        """), {"date": yesterday})
        search_stats = result.one()._asdict()

    summary = {
        "date": str(yesterday),
        "jobs": job_stats,
        "views": view_stats,
        "searches": search_stats
    }

    logger.info("daily_summary_generated", **summary)

    return summary
