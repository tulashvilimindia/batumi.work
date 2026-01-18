"""Category service for business logic."""
from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:
    """Service for category operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_category(self, category_id: UUID) -> Optional[Category]:
        """Get a category by ID."""
        query = select(Category).where(Category.id == category_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_category_by_slug(self, slug: str) -> Optional[Category]:
        """Get a category by slug."""
        query = select(Category).where(Category.slug == slug)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_categories(self, include_inactive: bool = False) -> list[Category]:
        """List all categories."""
        query = select(Category).order_by(Category.sort_order, Category.name_ge)

        if not include_inactive:
            query = query.where(Category.is_active == True)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_category(self, data: CategoryCreate) -> Category:
        """Create a new category."""
        category = Category(**data.model_dump())
        self.db.add(category)
        await self.db.flush()
        await self.db.refresh(category)
        return category

    async def update_category(
        self, category_id: UUID, data: CategoryUpdate
    ) -> Optional[Category]:
        """Update an existing category."""
        category = await self.get_category(category_id)
        if not category:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)

        await self.db.flush()
        await self.db.refresh(category)
        return category

    async def deactivate_category(self, category_id: UUID) -> bool:
        """Deactivate a category (soft delete)."""
        category = await self.get_category(category_id)
        if not category:
            return False

        category.is_active = False
        await self.db.flush()
        return True
