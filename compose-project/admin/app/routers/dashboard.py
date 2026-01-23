"""Dashboard router - overview and stats."""
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone
from pathlib import Path

from app.database import get_db
from app.config import settings

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    """Get dashboard overview data."""
    # Total jobs
    result = await db.execute(text("SELECT COUNT(*) FROM jobs"))
    total_jobs = result.scalar() or 0

    # Active jobs
    result = await db.execute(text("SELECT COUNT(*) FROM jobs WHERE status = 'active'"))
    active_jobs = result.scalar() or 0

    # Jobs by region
    result = await db.execute(text("""
        SELECT r.name_en, r.name_ge, COUNT(*) as count
        FROM jobs j
        LEFT JOIN regions r ON j.region_id = r.id
        GROUP BY r.id, r.name_en, r.name_ge
        ORDER BY count DESC
    """))
    regions = [{"name_en": row[0], "name_ge": row[1], "count": row[2]} for row in result.fetchall()]

    # Jobs by category
    result = await db.execute(text("""
        SELECT c.name_en, c.name_ge, COUNT(*) as count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        GROUP BY c.id, c.name_en, c.name_ge
        ORDER BY count DESC
    """))
    categories = [{"name_en": row[0], "name_ge": row[1], "count": row[2]} for row in result.fetchall()]

    # Jobs added today
    result = await db.execute(text("""
        SELECT COUNT(*) FROM jobs
        WHERE created_at >= CURRENT_DATE
    """))
    jobs_today = result.scalar() or 0

    # Jobs with salary
    result = await db.execute(text("SELECT COUNT(*) FROM jobs WHERE has_salary = true"))
    jobs_with_salary = result.scalar() or 0

    # Last parser run
    result = await db.execute(text("""
        SELECT MAX(last_seen_at) FROM jobs WHERE parsed_from != 'manual'
    """))
    last_parser_run = result.scalar()

    # Backup status
    backup_dir = Path(settings.BACKUP_DIR)
    backup_count = 0
    last_backup = None
    if backup_dir.exists():
        backups = list(backup_dir.rglob("*.sql.gz"))
        backup_count = len(backups)
        if backups:
            last_backup = max(backups, key=lambda f: f.stat().st_mtime)
            last_backup = datetime.fromtimestamp(last_backup.stat().st_mtime).isoformat()

    return {
        "stats": {
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "jobs_today": jobs_today,
            "jobs_with_salary": jobs_with_salary,
            "total_regions": len([r for r in regions if r["name_en"]]),
            "total_categories": len([c for c in categories if c["name_en"]]),
        },
        "by_region": regions[:10],
        "by_category": categories[:10],
        "parser": {
            "last_run": last_parser_run.isoformat() if last_parser_run else None,
        },
        "backup": {
            "count": backup_count,
            "last_backup": last_backup,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
