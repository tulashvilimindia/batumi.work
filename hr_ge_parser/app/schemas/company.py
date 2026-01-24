from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CompanyBase(BaseModel):
    name: str
    name_en: Optional[str] = None
    logo_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_anonymous: Optional[bool] = False


class CompanyResponse(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    external_id: int
    cover_image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    job_count: Optional[int] = None


class PaginationMeta(BaseModel):
    total: int
    page: int
    per_page: int
    total_pages: int


class CompanyListResponse(BaseModel):
    data: List[CompanyResponse]
    meta: PaginationMeta
