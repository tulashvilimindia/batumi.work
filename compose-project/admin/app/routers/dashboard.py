"""Dashboard router - overview and stats."""
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
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
        SELECT jobsge_lid, COUNT(*) as count
        FROM jobs
        GROUP BY jobsge_lid
        ORDER BY count DESC
    """))
    regions = [{"lid": row[0], "count": row[1]} for row in result.fetchall()]

    # Jobs by category
    result = await db.execute(text("""
        SELECT jobsge_cid, COUNT(*) as count
        FROM jobs
        GROUP BY jobsge_cid
        ORDER BY count DESC
    """))
    categories = [{"cid": row[0], "count": row[1]} for row in result.fetchall()]

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
            "total_regions": len([r for r in regions if r["lid"]]),
            "total_categories": len([c for c in categories if c["cid"]]),
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
        "timestamp": datetime.utcnow().isoformat(),
    }
