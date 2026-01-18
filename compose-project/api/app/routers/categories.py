"""Public categories API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.category_service import CategoryService
from app.schemas.category import CategoryListItem, CategoryResponse

router = APIRouter()


@router.get(
    "",
    response_model=list[CategoryListItem],
    summary="List categories",
    description="Get all active job categories",
)
async def list_categories(
    db: AsyncSession = Depends(get_db),
):
    """List all active categories."""
    service = CategoryService(db)
    return await service.list_categories()


@router.get(
    "/{slug}",
    response_model=CategoryResponse,
    summary="Get category",
    description="Get a category by slug",
)
async def get_category(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a category by slug."""
    service = CategoryService(db)
    category = await service.get_category_by_slug(slug)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category
