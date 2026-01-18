"""Region service for business logic."""
from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.region import Region
from app.schemas.region import RegionCreate, RegionUpdate


class RegionService:
    """Service for region operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_region(self, region_id: UUID) -> Optional[Region]:
        """Get a region by ID."""
        query = select(Region).where(Region.id == region_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_region_by_slug(self, slug: str) -> Optional[Region]:
        """Get a region by slug."""
        query = select(Region).where(Region.slug == slug)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_regions(self, include_inactive: bool = False) -> list[Region]:
        """List all regions."""
        query = select(Region).order_by(Region.level, Region.sort_order, Region.name_ge)

        if not include_inactive:
            query = query.where(Region.is_active == True)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def list_regions_by_level(
        self, level: int, include_inactive: bool = False
    ) -> list[Region]:
        """List regions by level (1=country, 2=region, 3=city)."""
        query = select(Region).where(Region.level == level)

        if not include_inactive:
            query = query.where(Region.is_active == True)

        query = query.order_by(Region.sort_order, Region.name_ge)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_children(
        self, parent_id: UUID, include_inactive: bool = False
    ) -> list[Region]:
        """Get child regions of a parent region."""
        query = select(Region).where(Region.parent_id == parent_id)

        if not include_inactive:
            query = query.where(Region.is_active == True)

        query = query.order_by(Region.sort_order, Region.name_ge)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_region(self, data: RegionCreate) -> Region:
        """Create a new region."""
        region = Region(**data.model_dump())
        self.db.add(region)
        await self.db.flush()
        await self.db.refresh(region)
        return region

    async def update_region(
        self, region_id: UUID, data: RegionUpdate
    ) -> Optional[Region]:
        """Update an existing region."""
        region = await self.get_region(region_id)
        if not region:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(region, field, value)

        await self.db.flush()
        await self.db.refresh(region)
        return region
