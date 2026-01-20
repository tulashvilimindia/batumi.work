"""Parser router - parser stats and control."""
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter()

# Region name mapping
REGION_NAMES = {
    14: "აჭარა (Adjara)",
    1: "თბილისი (Tbilisi)",
    8: "იმერეთი (Imereti)",
    3: "კახეთი (Kakheti)",
    5: "ქვემო ქართლი (Kvemo Kartli)",
    6: "შიდა ქართლი (Shida Kartli)",
    9: "გურია (Guria)",
    7: "სამცხე-ჯავახეთი (Samtskhe-Javakheti)",
    4: "მცხეთა-მთიანეთი (Mtskheta-Mtianeti)",
    13: "სამეგრელო (Samegrelo)",
    12: "რაჭა-ლეჩხუმი (Racha-Lechkhumi)",
    17: "დისტანციური (Remote)",
}

# Category name mapping
CATEGORY_NAMES = {
    1: "ადმინისტრაცია (Administration)",
    2: "გაყიდვები (Sales)",
    3: "ფინანსები (Finance)",
    4: "მარკეტინგი (Marketing)",
    5: "ლოგისტიკა (Logistics)",
    6: "IT/პროგრამირება (IT/Programming)",
    7: "სამართალი (Law)",
    8: "მედიცინა (Medicine)",
    9: "სხვა (Other)",
    10: "კვება (Food/Catering)",
    11: "მშენებლობა (Construction)",
    12: "განათლება (Education)",
    13: "მედია (Media)",
    14: "სილამაზე (Beauty)",
    16: "დასუფთავება (Cleaning)",
    17: "დაცვა (Security)",
    18: "ტექნიკური (Technical)",
}


@router.get("/stats")
async def get_parser_stats(db: AsyncSession = Depends(get_db)):
    """Get parser statistics by region and category."""
    # Total jobs
    result = await db.execute(text("SELECT COUNT(*) FROM jobs"))
    total_jobs = result.scalar() or 0

    # Jobs by region
    result = await db.execute(text("""
        SELECT jobsge_lid, COUNT(*) as count
        FROM jobs
        GROUP BY jobsge_lid
        ORDER BY count DESC
    """))
    by_region = [
        {
            "lid": row[0],
            "name": REGION_NAMES.get(row[0], "Unknown") if row[0] else "Unknown",
            "count": row[1]
        }
        for row in result.fetchall()
    ]

    # Jobs by category
    result = await db.execute(text("""
        SELECT jobsge_cid, COUNT(*) as count
        FROM jobs
        GROUP BY jobsge_cid
        ORDER BY count DESC
    """))
    by_category = [
        {
            "cid": row[0],
            "name": CATEGORY_NAMES.get(row[0], "Unknown") if row[0] else "Unknown",
            "count": row[1]
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
        "total_regions": len([r for r in by_region if r["lid"]]),
        "total_categories": len([c for c in by_category if c["cid"]]),
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
