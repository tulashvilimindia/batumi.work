"""Job service for business logic."""
from typing import Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, func, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.job import Job
from app.models.category import Category
from app.models.region import Region
from app.schemas.job import JobCreate, JobUpdate, JobSearchParams
from app.schemas.base import PaginatedResponse


class JobService:
    """Service for job operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_job(self, job_id: UUID) -> Optional[Job]:
        """Get a job by ID."""
        query = (
            select(Job)
            .options(selectinload(Job.category), selectinload(Job.region))
            .where(Job.id == job_id)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_jobs(self, params: JobSearchParams) -> PaginatedResponse:
        """List jobs with filters and pagination."""
        query = select(Job).options(
            selectinload(Job.category), selectinload(Job.region)
        )

        # Apply filters
        filters = []

        # Status filter (default: active)
        if params.status:
            filters.append(Job.status == params.status)

        # Search query (in title and company name)
        if params.q:
            search_term = f"%{params.q}%"
            filters.append(
                or_(
                    Job.title_ge.ilike(search_term),
                    Job.title_en.ilike(search_term),
                    Job.company_name.ilike(search_term),
                )
            )

        # Category filter (by slug)
        if params.category:
            category_subq = select(Category.id).where(Category.slug == params.category)
            filters.append(Job.category_id.in_(category_subq))

        # jobs.ge category ID filter (cid)
        if params.cid is not None:
            filters.append(Job.jobsge_cid == params.cid)

        # Region filter (by slug)
        if params.region:
            region_subq = select(Region.id).where(Region.slug == params.region)
            filters.append(Job.region_id.in_(region_subq))

        # jobs.ge location/region ID filter (lid)
        if params.lid is not None:
            filters.append(Job.jobsge_lid == params.lid)

        # Location text filter (e.g., "აჭარა" for Adjara) - partial match
        if params.location:
            filters.append(Job.location.ilike(f"%{params.location}%"))

        # Has salary filter
        if params.has_salary is not None:
            filters.append(Job.has_salary == params.has_salary)

        # VIP filter
        if params.is_vip is not None:
            filters.append(Job.is_vip == params.is_vip)

        # Employment type filter
        if params.employment_type:
            filters.append(Job.employment_type == params.employment_type)

        # Remote type filter
        if params.remote_type:
            filters.append(Job.remote_type == params.remote_type)

        if filters:
            query = query.where(*filters)

        # Count total before pagination
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        # Apply sorting
        sort_field = params.sort or "-published_at"
        descending = sort_field.startswith("-")
        field_name = sort_field.lstrip("-")

        # Map sort field names to columns
        sort_columns = {
            "published_at": Job.published_at,
            "created_at": Job.created_at,
            "deadline_at": Job.deadline_at,
            "title_ge": Job.title_ge,
        }

        sort_column = sort_columns.get(field_name, Job.published_at)
        if descending:
            query = query.order_by(desc(sort_column).nulls_last())
        else:
            query = query.order_by(asc(sort_column).nulls_last())

        # Apply pagination
        offset = (params.page - 1) * params.page_size
        query = query.offset(offset).limit(params.page_size)

        # Execute
        result = await self.db.execute(query)
        jobs = result.scalars().all()

        pages = (total + params.page_size - 1) // params.page_size

        return PaginatedResponse(
            items=list(jobs),
            total=total,
            page=params.page,
            page_size=params.page_size,
            pages=pages,
        )

    async def create_job(self, data: JobCreate) -> Job:
        """Create a new job."""
        job = Job(
            **data.model_dump(),
            first_seen_at=datetime.utcnow(),
            last_seen_at=datetime.utcnow(),
        )
        self.db.add(job)
        await self.db.flush()
        await self.db.refresh(job)

        # Load relationships
        return await self.get_job(job.id)

    async def update_job(self, job_id: UUID, data: JobUpdate) -> Optional[Job]:
        """Update an existing job."""
        job = await self.get_job(job_id)
        if not job:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(job, field, value)

        job.last_seen_at = datetime.utcnow()
        await self.db.flush()
        await self.db.refresh(job)

        return await self.get_job(job_id)

    async def update_job_status(self, job_id: UUID, status: str) -> Optional[Job]:
        """Update job status."""
        job = await self.get_job(job_id)
        if not job:
            return None

        job.status = status
        await self.db.flush()
        await self.db.refresh(job)

        return job

    async def delete_job(self, job_id: UUID) -> bool:
        """Soft delete a job (set status to inactive)."""
        job = await self.get_job(job_id)
        if not job:
            return False

        job.status = "inactive"
        await self.db.flush()
        return True
