"""Job schemas."""
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

from app.schemas.base import BaseSchema
from app.schemas.category import CategoryListItem
from app.schemas.region import RegionListItem


# Type definitions
JobStatus = Literal["active", "inactive", "expired", "pending_review"]
RemoteType = Literal["onsite", "remote", "hybrid"]
EmploymentType = Literal["full_time", "part_time", "contract", "internship", "freelance"]
ExperienceLevel = Literal["entry", "mid", "senior", "executive", "any"]
SalaryPeriod = Literal["hourly", "daily", "monthly", "yearly"]
SalaryCurrency = Literal["GEL", "USD", "EUR"]


class JobBase(BaseModel):
    """Base job fields."""

    title_ge: str = Field(..., min_length=1, max_length=500)
    title_en: Optional[str] = Field(None, max_length=500)
    body_ge: str = Field(..., min_length=1)
    body_en: Optional[str] = None

    company_name: Optional[str] = Field(None, max_length=255)
    company_id: Optional[UUID] = None

    location: Optional[str] = Field(None, max_length=255)
    region_id: Optional[UUID] = None
    remote_type: RemoteType = "onsite"

    category_id: UUID

    employment_type: EmploymentType = "full_time"
    experience_level: Optional[ExperienceLevel] = None

    has_salary: bool = False
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)
    salary_currency: SalaryCurrency = "GEL"
    salary_period: SalaryPeriod = "monthly"

    published_at: Optional[datetime] = None
    deadline_at: Optional[datetime] = None

    is_vip: bool = False
    is_featured: bool = False

    source_url: Optional[str] = None

    @field_validator("salary_max")
    @classmethod
    def validate_salary_range(cls, v, info):
        """Ensure salary_max >= salary_min."""
        if v is not None and info.data.get("salary_min") is not None:
            if v < info.data["salary_min"]:
                raise ValueError("salary_max must be >= salary_min")
        return v


class JobCreate(JobBase):
    """Schema for creating a job."""

    status: JobStatus = "active"
    parsed_from: str = "manual"
    external_id: Optional[str] = None


class JobUpdate(BaseModel):
    """Schema for updating a job."""

    title_ge: Optional[str] = Field(None, min_length=1, max_length=500)
    title_en: Optional[str] = Field(None, max_length=500)
    body_ge: Optional[str] = Field(None, min_length=1)
    body_en: Optional[str] = None

    company_name: Optional[str] = Field(None, max_length=255)
    company_id: Optional[UUID] = None

    location: Optional[str] = Field(None, max_length=255)
    region_id: Optional[UUID] = None
    remote_type: Optional[RemoteType] = None

    category_id: Optional[UUID] = None

    employment_type: Optional[EmploymentType] = None
    experience_level: Optional[ExperienceLevel] = None

    has_salary: Optional[bool] = None
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)
    salary_currency: Optional[SalaryCurrency] = None
    salary_period: Optional[SalaryPeriod] = None

    published_at: Optional[datetime] = None
    deadline_at: Optional[datetime] = None

    is_vip: Optional[bool] = None
    is_featured: Optional[bool] = None

    source_url: Optional[str] = None


class JobStatusUpdate(BaseModel):
    """Schema for updating job status."""

    status: JobStatus


class JobResponse(BaseSchema):
    """Full job response schema."""

    id: UUID
    title_ge: str
    title_en: Optional[str]
    body_ge: str
    body_en: Optional[str]

    company_name: Optional[str]
    company_id: Optional[UUID]

    location: Optional[str]
    region_id: Optional[UUID]
    remote_type: str

    category_id: UUID
    category: Optional[CategoryListItem] = None

    employment_type: str
    experience_level: Optional[str]

    has_salary: bool
    salary_min: Optional[int]
    salary_max: Optional[int]
    salary_currency: str
    salary_period: str

    published_at: Optional[datetime]
    deadline_at: Optional[datetime]

    status: str
    is_vip: bool
    is_featured: bool

    parsed_from: str
    external_id: Optional[str]
    source_url: Optional[str]

    # jobs.ge original filter values
    jobsge_cid: Optional[int] = None
    jobsge_lid: Optional[int] = None

    first_seen_at: Optional[datetime]
    last_seen_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class JobListItem(BaseSchema):
    """Simplified job for list views."""

    id: UUID
    title_ge: str
    title_en: Optional[str]
    company_name: Optional[str]
    location: Optional[str]
    remote_type: str
    category: Optional[CategoryListItem] = None
    region: Optional[RegionListItem] = None
    has_salary: bool
    salary_min: Optional[int]
    salary_max: Optional[int]
    salary_currency: str
    published_at: Optional[datetime]
    deadline_at: Optional[datetime]
    is_vip: bool
    status: str
    parsed_from: str
    source_url: Optional[str]
    # jobs.ge original filter values
    jobsge_cid: Optional[int] = None
    jobsge_lid: Optional[int] = None


class JobSearchParams(BaseModel):
    """Query parameters for job search.

    Supports two filter styles:
    - Slug-based: category, region (our internal slugs)
    - jobs.ge style: cid, lid (original jobs.ge filter IDs)
    """

    q: Optional[str] = Field(None, description="Search query for title/company")
    category: Optional[str] = Field(None, description="Category slug")
    cid: Optional[int] = Field(None, description="jobs.ge category ID (1-18)")
    region: Optional[str] = Field(None, description="Region slug")
    lid: Optional[int] = Field(None, description="jobs.ge location/region ID")
    location: Optional[str] = Field(None, description="Location text filter (e.g., აჭარა)")
    has_salary: Optional[bool] = Field(None, description="Filter jobs with salary info")
    is_vip: Optional[bool] = Field(None, description="Filter VIP jobs")
    status: Optional[JobStatus] = Field("active", description="Job status")
    employment_type: Optional[EmploymentType] = None
    remote_type: Optional[RemoteType] = None
    sort: Optional[str] = Field("-published_at", description="Sort field (prefix - for desc)")
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
