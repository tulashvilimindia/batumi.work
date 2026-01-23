"""Scheduled analytics tasks for the worker."""
import structlog
from datetime import datetime, timedelta, timezone
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
    cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)

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
        yesterday = datetime.now(timezone.utc).date() - timedelta(days=1)

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


async def generate_weekly_report():
    """Generate comprehensive weekly analytics report.

    This function generates a summary of the week's job board activity,
    including key metrics, top categories, insights, and parser status.

    The report can be logged, stored, or sent via email (if configured).
    """
    async with await get_db_session() as session:
        # Calculate date range (last 7 days)
        end_date = datetime.now(timezone.utc).date()
        start_date = end_date - timedelta(days=7)
        prev_week_start = start_date - timedelta(days=7)
        prev_week_end = start_date

        # Get current week stats
        result = await session.execute(text("""
            SELECT
                COUNT(*) as total_active_jobs,
                COUNT(*) FILTER (WHERE DATE(created_at) >= :start_date) as new_jobs_this_week
            FROM jobs
            WHERE status = 'active'
        """), {"start_date": start_date})
        job_stats = result.one()._asdict()

        # Get previous week stats for comparison
        result = await session.execute(text("""
            SELECT
                COUNT(*) FILTER (WHERE DATE(created_at) >= :prev_start AND DATE(created_at) < :prev_end) as new_jobs_last_week
            FROM jobs
        """), {"prev_start": prev_week_start, "prev_end": prev_week_end})
        prev_stats = result.one()._asdict()

        # Calculate growth
        new_this_week = job_stats.get("new_jobs_this_week", 0) or 0
        new_last_week = prev_stats.get("new_jobs_last_week", 0) or 0
        jobs_growth = ((new_this_week - new_last_week) / max(new_last_week, 1)) * 100 if new_last_week else 0

        # Total views this week
        result = await session.execute(text("""
            SELECT
                COUNT(*) as total_views,
                COUNT(DISTINCT session_id) as unique_visitors,
                COUNT(DISTINCT job_id) as jobs_viewed
            FROM job_views
            WHERE DATE(viewed_at) >= :start_date
        """), {"start_date": start_date})
        view_stats = result.one()._asdict()

        # Previous week views for comparison
        result = await session.execute(text("""
            SELECT COUNT(*) as total_views FROM job_views
            WHERE DATE(viewed_at) >= :prev_start AND DATE(viewed_at) < :prev_end
        """), {"prev_start": prev_week_start, "prev_end": prev_week_end})
        prev_views = result.scalar() or 0
        curr_views = view_stats.get("total_views", 0) or 0
        views_growth = ((curr_views - prev_views) / max(prev_views, 1)) * 100 if prev_views else 0

        # Top categories this week
        result = await session.execute(text("""
            SELECT
                c.name_ge,
                c.slug,
                COUNT(j.id) as job_count,
                ROUND(COUNT(j.id) * 100.0 / NULLIF(SUM(COUNT(j.id)) OVER(), 0), 1) as percentage
            FROM jobs j
            LEFT JOIN categories c ON j.category_id = c.id
            WHERE j.status = 'active' AND DATE(j.created_at) >= :start_date
            GROUP BY c.id, c.name_ge, c.slug
            ORDER BY job_count DESC
            LIMIT 5
        """), {"start_date": start_date})
        top_categories = [row._asdict() for row in result.all()]

        # Top search queries with no results (content gap)
        result = await session.execute(text("""
            SELECT query, COUNT(*) as search_count
            FROM search_analytics
            WHERE results_count = 0 AND DATE(searched_at) >= :start_date
            GROUP BY query
            ORDER BY search_count DESC
            LIMIT 5
        """), {"start_date": start_date})
        zero_result_queries = [row._asdict() for row in result.all()]

        # Parser status
        result = await session.execute(text("""
            SELECT
                parsed_from,
                COUNT(*) as job_count,
                MAX(last_seen_at) as last_run
            FROM jobs
            WHERE parsed_from != 'manual'
            GROUP BY parsed_from
        """))
        parser_stats = [row._asdict() for row in result.all()]

        # Regional distribution
        result = await session.execute(text("""
            SELECT
                location,
                COUNT(*) as job_count
            FROM jobs
            WHERE status = 'active' AND DATE(created_at) >= :start_date
            GROUP BY location
            ORDER BY job_count DESC
            LIMIT 5
        """), {"start_date": start_date})
        regional_stats = [row._asdict() for row in result.all()]

        # Salary stats for IT category
        result = await session.execute(text("""
            SELECT
                ROUND(AVG(salary_min)) as avg_salary_min,
                ROUND(AVG(salary_max)) as avg_salary_max
            FROM jobs j
            JOIN categories c ON j.category_id = c.id
            WHERE j.status = 'active'
                AND j.has_salary = true
                AND c.slug = 'it-programming'
        """))
        it_salary = result.one()._asdict()

    # Build report
    week_num = end_date.isocalendar()[1]
    year = end_date.year

    report = {
        "week": week_num,
        "year": year,
        "period": f"{start_date} to {end_date}",
        "summary": {
            "active_jobs": job_stats.get("total_active_jobs", 0) or 0,
            "new_jobs": new_this_week,
            "jobs_growth_percent": round(jobs_growth, 1),
            "total_views": curr_views,
            "views_growth_percent": round(views_growth, 1),
            "unique_visitors": view_stats.get("unique_visitors", 0) or 0,
        },
        "top_categories": top_categories,
        "insights": {
            "zero_result_queries": zero_result_queries,
            "regional_stats": regional_stats,
            "it_salary_avg": it_salary.get("avg_salary_min"),
        },
        "parser_status": parser_stats,
    }

    # Log the report
    logger.info(
        "weekly_report_generated",
        week=week_num,
        year=year,
        active_jobs=report["summary"]["active_jobs"],
        new_jobs=report["summary"]["new_jobs"],
        jobs_growth=f"{report['summary']['jobs_growth_percent']}%",
        views=report["summary"]["total_views"],
        views_growth=f"{report['summary']['views_growth_percent']}%",
    )

    # Format text report for logging
    text_report = f"""
=== JobBoard Weekly Report - Week {week_num}, {year} ===

SUMMARY
- Active jobs: {report['summary']['active_jobs']} ({'+' if jobs_growth >= 0 else ''}{round(jobs_growth)}% vs last week)
- New jobs posted: {new_this_week}
- Total views: {curr_views} ({'+' if views_growth >= 0 else ''}{round(views_growth)}%)
- Unique visitors: {report['summary']['unique_visitors']}

TOP CATEGORIES
"""
    for i, cat in enumerate(top_categories[:5], 1):
        text_report += f"{i}. {cat.get('name_ge', 'Other')} - {cat.get('job_count', 0)} jobs ({cat.get('percentage', 0)}%)\n"

    if zero_result_queries:
        text_report += "\nINSIGHTS\n"
        for q in zero_result_queries[:3]:
            text_report += f"- '{q['query']}' searches had 0 results ({q['search_count']} times)\n"

    if it_salary.get("avg_salary_min"):
        text_report += f"- Average IT salary: {it_salary.get('avg_salary_min')} GEL\n"

    text_report += "\nPARSER STATUS\n"
    for p in parser_stats:
        last_run = p.get('last_run')
        last_run_str = last_run.strftime("%Y-%m-%d %H:%M") if last_run else "N/A"
        text_report += f"- {p['parsed_from']}: {p['job_count']} jobs, last run: {last_run_str}\n"

    logger.info("weekly_report_text", report=text_report)

    # TODO: Send email if SMTP is configured
    smtp_host = os.getenv("SMTP_HOST")
    if smtp_host:
        await _send_weekly_email(report, text_report)

    return report


async def _send_weekly_email(report: dict, text_report: str):
    """Send weekly report via email (if SMTP configured).

    Args:
        report: Structured report data
        text_report: Formatted text version
    """
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASS", "")
    from_email = os.getenv("REPORT_FROM_EMAIL", "reports@jobboard.ge")
    to_emails = os.getenv("REPORT_TO_EMAILS", "").split(",")

    if not smtp_host or not to_emails[0]:
        logger.info("email_skipped", reason="SMTP not configured")
        return

    try:
        week_num = report["week"]
        year = report["year"]

        msg = MIMEMultipart()
        msg["Subject"] = f"JobBoard Weekly Report - Week {week_num}, {year}"
        msg["From"] = from_email
        msg["To"] = ", ".join(to_emails)

        msg.attach(MIMEText(text_report, "plain"))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            if smtp_user and smtp_pass:
                server.starttls()
                server.login(smtp_user, smtp_pass)
            server.send_message(msg)

        logger.info("weekly_email_sent", recipients=to_emails)
    except Exception as e:
        logger.error("weekly_email_failed", error=str(e))
