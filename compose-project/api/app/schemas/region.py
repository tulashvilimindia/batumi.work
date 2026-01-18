"""Region schemas."""
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

from app.schemas.base import BaseSchema


class RegionBase(BaseModel):
    """Base region fields."""

    name_ge: str = Field(..., min_length=1, max_length=100)
    name_en: Optional[str] = Field(None, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    level: int = Field(..., ge=1, le=3)  # 1=country, 2=region, 3=city
    parent_id: Optional[UUID] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    sort_order: int = Field(default=0)


class RegionCreate(RegionBase):
    """Schema for creating a region."""

    pass


class RegionUpdate(BaseModel):
    """Schema for updating a region."""

    name_ge: Optional[str] = Field(None, min_length=1, max_length=100)
    name_en: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None


class RegionResponse(BaseSchema):
    """Region response schema."""

    id: UUID
    parent_id: Optional[UUID]
    level: int
    name_ge: str
    name_en: Optional[str]
    slug: str
    latitude: Optional[Decimal]
    longitude: Optional[Decimal]
    is_active: bool
    sort_order: int
    created_at: datetime


class RegionListItem(BaseSchema):
    """Simplified region for list views."""

    id: UUID
    parent_id: Optional[UUID]
    level: int
    name_ge: str
    name_en: Optional[str]
    slug: str
    is_active: bool


class RegionHierarchy(BaseSchema):
    """Region with nested children."""

    id: UUID
    level: int
    name_ge: str
    name_en: Optional[str]
    slug: str
    children: list["RegionHierarchy"] = []
