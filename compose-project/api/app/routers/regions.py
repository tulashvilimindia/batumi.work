"""Public regions API endpoints."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.region_service import RegionService
from app.schemas.region import RegionListItem, RegionResponse

router = APIRouter()


@router.get(
    "",
    response_model=list[RegionListItem],
    summary="List regions",
    description="Get all active regions, optionally filtered by level",
)
async def list_regions(
    level: Optional[int] = Query(None, ge=1, le=3, description="Filter by level (1=country, 2=region, 3=city)"),
    db: AsyncSession = Depends(get_db),
):
    """List all active regions."""
    service = RegionService(db)

    if level is not None:
        return await service.list_regions_by_level(level)

    return await service.list_regions()


@router.get(
    "/{slug}",
    response_model=RegionResponse,
    summary="Get region",
    description="Get a region by slug",
)
async def get_region(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a region by slug."""
    service = RegionService(db)
    region = await service.get_region_by_slug(slug)

    if not region:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Region not found",
        )

    return region
