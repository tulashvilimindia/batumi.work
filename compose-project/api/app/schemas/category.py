"""Category schemas."""
from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.base import BaseSchema


class CategoryBase(BaseModel):
    """Base category fields."""

    name_ge: str = Field(..., min_length=1, max_length=100)
    name_en: Optional[str] = Field(None, max_length=100)
    code: str = Field(..., min_length=1, max_length=50)
    slug: str = Field(..., min_length=1, max_length=100)
    description_ge: Optional[str] = Field(None, max_length=500)
    description_en: Optional[str] = Field(None, max_length=500)
    sort_order: int = Field(default=0)


class CategoryCreate(CategoryBase):
    """Schema for creating a category."""

    pass


class CategoryUpdate(BaseModel):
    """Schema for updating a category."""

    name_ge: Optional[str] = Field(None, min_length=1, max_length=100)
    name_en: Optional[str] = Field(None, max_length=100)
    description_ge: Optional[str] = Field(None, max_length=500)
    description_en: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class CategoryResponse(BaseSchema):
    """Category response schema."""

    id: UUID
    name_ge: str
    name_en: Optional[str]
    code: str
    slug: str
    description_ge: Optional[str]
    description_en: Optional[str]
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


class CategoryListItem(BaseSchema):
    """Simplified category for list views."""

    id: UUID
    name_ge: str
    name_en: Optional[str]
    slug: str
    is_active: bool
