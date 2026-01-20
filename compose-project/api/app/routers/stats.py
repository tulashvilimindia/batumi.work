"""Public stats endpoint for parser status."""
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.models.job import Job


class RegionStats(BaseModel):
    """Stats for a region."""
    lid: Optional[int]
    name: Optional[str]
    count: int


class CategoryStats(BaseModel):
    """Stats for a category."""
    cid: Optional[int]
    name: Optional[str]
    count: int


class ParserStats(BaseModel):
    """Overall parser statistics."""
    total_jobs: int
    total_regions: int
    total_categories: int
    by_region: List[RegionStats]
    by_category: List[CategoryStats]


router = APIRouter(tags=["Stats"])


# Region lid to name mapping
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

# Category cid to name mapping
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


@router.get("/stats", response_model=ParserStats)
async def get_parser_stats(
    db: AsyncSession = Depends(get_db),
):
    """Get parser statistics - job counts by region and category.

    This endpoint shows the current state of parsed data.
    Use it to monitor parser progress.
    """
    # Total jobs
    total_query = select(func.count()).select_from(Job)
    total_result = await db.execute(total_query)
    total_jobs = total_result.scalar_one()

    # Jobs by region (lid)
    region_query = (
        select(Job.jobsge_lid, func.count(Job.id).label("count"))
        .group_by(Job.jobsge_lid)
        .order_by(func.count(Job.id).desc())
    )
    region_result = await db.execute(region_query)
    region_rows = region_result.all()

    by_region = [
        RegionStats(
            lid=row.jobsge_lid,
            name=REGION_NAMES.get(row.jobsge_lid) if row.jobsge_lid else "Unknown",
            count=row.count,
        )
        for row in region_rows
    ]

    # Jobs by category (cid)
    category_query = (
        select(Job.jobsge_cid, func.count(Job.id).label("count"))
        .group_by(Job.jobsge_cid)
        .order_by(func.count(Job.id).desc())
    )
    category_result = await db.execute(category_query)
    category_rows = category_result.all()

    by_category = [
        CategoryStats(
            cid=row.jobsge_cid,
            name=CATEGORY_NAMES.get(row.jobsge_cid) if row.jobsge_cid else "Unknown",
            count=row.count,
        )
        for row in category_rows
    ]

    return ParserStats(
        total_jobs=total_jobs,
        total_regions=len([r for r in by_region if r.lid is not None]),
        total_categories=len([c for c in by_category if c.cid is not None]),
        by_region=by_region,
        by_category=by_category,
    )
