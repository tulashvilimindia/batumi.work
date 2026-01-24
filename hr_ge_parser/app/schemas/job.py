from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


class JobBase(BaseModel):
    title: str
    title_en: Optional[str] = None
    description: Optional[str] = None
    slug: Optional[str] = None
    publish_date: Optional[datetime] = None
    deadline_date: Optional[datetime] = None
    salary_from: Optional[int] = None
    salary_to: Optional[int] = None
    salary_currency: Optional[str] = "GEL"
    is_work_from_home: Optional[bool] = False
    is_suitable_for_student: Optional[bool] = False
    employment_type: Optional[str] = None
    work_schedule: Optional[str] = None
    is_expired: Optional[bool] = False


class JobCreate(JobBase):
    external_id: int
    company_id: Optional[int] = None


class CompanyInJob(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    external_id: int
    name: str
    name_en: Optional[str] = None
    logo_url: Optional[str] = None
    is_anonymous: Optional[bool] = False


class JobResponse(JobBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    external_id: int
    company: Optional[CompanyInJob] = None
    addresses: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    created_at: Optional[datetime] = None


class JobDetail(JobResponse):
    model_config = ConfigDict(from_attributes=True)

    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_name: Optional[str] = None
    hide_contact_person: Optional[bool] = False
    is_priority: Optional[bool] = False
    is_with_bonus: Optional[bool] = False
    show_salary: Optional[bool] = True
    application_method: Optional[int] = None
    benefits: Optional[List[Any]] = None
    driving_licenses: Optional[List[Any]] = None
    renewal_date: Optional[datetime] = None
    last_scraped_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PaginationMeta(BaseModel):
    total: int
    page: int
    per_page: int
    total_pages: int


class JobListResponse(BaseModel):
    data: List[JobResponse]
    meta: PaginationMeta
