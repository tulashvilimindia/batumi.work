"""Parser router - parser stats and control."""
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter()


@router.get("/stats")
async def get_parser_stats(db: AsyncSession = Depends(get_db)):
    """Get parser statistics by region and category."""
    # Total jobs
    result = await db.execute(text("SELECT COUNT(*) FROM jobs"))
    total_jobs = result.scalar() or 0

    # Jobs by region
    result = await db.execute(text("""
        SELECT r.name_en, r.name_ge, COUNT(*) as count
        FROM jobs j
        LEFT JOIN regions r ON j.region_id = r.id
        GROUP BY r.id, r.name_en, r.name_ge
        ORDER BY count DESC
    """))
    by_region = [
        {
            "name_en": row[0],
            "name_ge": row[1],
            "count": row[2]
        }
        for row in result.fetchall()
    ]

    # Jobs by category
    result = await db.execute(text("""
        SELECT c.name_en, c.name_ge, COUNT(*) as count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        GROUP BY c.id, c.name_en, c.name_ge
        ORDER BY count DESC
    """))
    by_category = [
        {
            "name_en": row[0],
            "name_ge": row[1],
            "count": row[2]
        }
        for row in result.fetchall()
    ]

    # Last parsed job
    result = await db.execute(text("""
        SELECT MAX(last_seen_at) FROM jobs WHERE parsed_from != 'manual'
    """))
    last_parsed = result.scalar()

    # Jobs parsed today
    result = await db.execute(text("""
        SELECT COUNT(*) FROM jobs
        WHERE first_seen_at >= CURRENT_DATE AND parsed_from != 'manual'
    """))
    parsed_today = result.scalar() or 0

    return {
        "total_jobs": total_jobs,
        "total_regions": len([r for r in by_region if r["name_en"]]),
        "total_categories": len([c for c in by_category if c["name_en"]]),
        "parsed_today": parsed_today,
        "last_parsed": last_parsed.isoformat() if last_parsed else None,
        "by_region": by_region,
        "by_category": by_category,
    }


@router.get("/sources")
async def get_parser_sources(db: AsyncSession = Depends(get_db)):
    """Get parser source statistics."""
    result = await db.execute(text("""
        SELECT parsed_from, COUNT(*) as count
        FROM jobs
        GROUP BY parsed_from
        ORDER BY count DESC
    """))

    sources = [
        {"source": row[0], "count": row[1]}
        for row in result.fetchall()
    ]

    return {"sources": sources}
