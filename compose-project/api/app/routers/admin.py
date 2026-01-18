"""Admin API endpoints - protected by API key."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import verify_api_key
from app.services.job_service import JobService
from app.services.category_service import CategoryService
from app.schemas.job import (
    JobCreate,
    JobUpdate,
    JobStatusUpdate,
    JobResponse,
)
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)
from app.schemas.base import MessageResponse

router = APIRouter(dependencies=[Depends(verify_api_key)])


# ============== Job Admin Endpoints ==============


@router.post(
    "/jobs",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create job",
    description="Create a new job posting",
)
async def create_job(
    data: JobCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new job."""
    service = JobService(db)
    return await service.create_job(data)


@router.put(
    "/jobs/{job_id}",
    response_model=JobResponse,
    summary="Update job",
    description="Update an existing job",
)
async def update_job(
    job_id: UUID,
    data: JobUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing job."""
    service = JobService(db)
    job = await service.update_job(job_id, data)

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    return job


@router.patch(
    "/jobs/{job_id}/status",
    response_model=JobResponse,
    summary="Update job status",
    description="Change job status (active/inactive/expired)",
)
async def update_job_status(
    job_id: UUID,
    data: JobStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update job status."""
    service = JobService(db)
    job = await service.update_job_status(job_id, data.status)

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    return job


@router.delete(
    "/jobs/{job_id}",
    response_model=MessageResponse,
    summary="Delete job",
    description="Soft delete a job (sets status to inactive)",
)
async def delete_job(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Soft delete a job."""
    service = JobService(db)
    deleted = await service.delete_job(job_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    return MessageResponse(message="Job deleted successfully")


# ============== Category Admin Endpoints ==============


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create category",
    description="Create a new job category",
)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new category."""
    service = CategoryService(db)
    return await service.create_category(data)


@router.put(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    summary="Update category",
    description="Update an existing category",
)
async def update_category(
    category_id: UUID,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a category."""
    service = CategoryService(db)
    category = await service.update_category(category_id, data)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


@router.delete(
    "/categories/{category_id}",
    response_model=MessageResponse,
    summary="Deactivate category",
    description="Deactivate a category (soft delete)",
)
async def deactivate_category(
    category_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Deactivate a category."""
    service = CategoryService(db)
    deactivated = await service.deactivate_category(category_id)

    if not deactivated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return MessageResponse(message="Category deactivated successfully")
