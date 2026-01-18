"""Scheduled tasks package."""
from app.tasks.analytics import (
    refresh_materialized_views,
    cleanup_old_analytics,
    generate_daily_summary,
)

__all__ = [
    "refresh_materialized_views",
    "cleanup_old_analytics",
    "generate_daily_summary",
]
