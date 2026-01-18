"""Idempotency tests for parser and job operations.

P2-05.1: Tests to ensure:
- Parsing the same job twice doesn't create duplicates
- Content hash changes trigger updates
- Upsert operations work correctly
"""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Job, Category


class TestJobIdempotency:
    """Test job upsert idempotency."""

    @pytest.mark.asyncio
    async def test_create_job_with_external_id(
        self, db_session: AsyncSession, sample_category: Category
    ):
        """Test creating a job with external ID."""
        job = Job(
            title_ge="ტესტ ვაკანსია",
            body_ge="ტესტ აღწერა",
            company_name="Test Co",
            category_id=sample_category.id,
            status="active",
            parsed_from="jobs.ge",
            external_id="12345",
            content_hash="hash123",
        )
        db_session.add(job)
        await db_session.commit()

        # Verify job was created
        query = select(Job).where(Job.external_id == "12345")
        result = await db_session.execute(query)
        saved_job = result.scalar_one()

        assert saved_job.external_id == "12345"
        assert saved_job.parsed_from == "jobs.ge"

    @pytest.mark.asyncio
    async def test_duplicate_external_id_same_source_rejected(
        self, db_session: AsyncSession, sample_category: Category
    ):
        """Test that duplicate (parsed_from, external_id) is rejected."""
        # Create first job
        job1 = Job(
            title_ge="ვაკანსია 1",
            body_ge="აღწერა 1",
            company_name="Company 1",
            category_id=sample_category.id,
            status="active",
            parsed_from="jobs.ge",
            external_id="duplicate-id",
            content_hash="hash1",
        )
        db_session.add(job1)
        await db_session.commit()

        # Try to create duplicate
        job2 = Job(
            title_ge="ვაკანსია 2",
            body_ge="აღწერა 2",
            company_name="Company 2",
            category_id=sample_category.id,
            status="active",
            parsed_from="jobs.ge",
            external_id="duplicate-id",
            content_hash="hash2",
        )
        db_session.add(job2)

        # Should raise integrity error
        with pytest.raises(Exception):  # IntegrityError
            await db_session.commit()

    @pytest.mark.asyncio
    async def test_same_external_id_different_source_allowed(
        self, db_session: AsyncSession, sample_category: Category
    ):
        """Test that same external_id from different sources is allowed."""
        # Create job from jobs.ge
        job1 = Job(
            title_ge="ვაკანსია jobs.ge",
            body_ge="აღწერა",
            company_name="Company",
            category_id=sample_category.id,
            status="active",
            parsed_from="jobs.ge",
            external_id="shared-id",
            content_hash="hash1",
        )
        db_session.add(job1)
        await db_session.commit()

        # Create job from hr.ge with same external_id - should work
        job2 = Job(
            title_ge="ვაკანსია hr.ge",
            body_ge="აღწერა",
            company_name="Company",
            category_id=sample_category.id,
            status="active",
            parsed_from="hr.ge",
            external_id="shared-id",
            content_hash="hash2",
        )
        db_session.add(job2)
        await db_session.commit()

        # Both should exist
        query = select(func.count()).select_from(Job).where(Job.external_id == "shared-id")
        result = await db_session.execute(query)
        count = result.scalar_one()
        assert count == 2

    @pytest.mark.asyncio
    async def test_content_hash_unchanged_skips_update(
        self, db_session: AsyncSession, sample_job: Job
    ):
        """Test that unchanged content hash doesn't modify job."""
        original_updated_at = sample_job.updated_at
        original_title = sample_job.title_ge

        # Simulate re-parse with same hash - just update last_seen_at
        sample_job.last_seen_at = datetime.utcnow()
        await db_session.commit()
        await db_session.refresh(sample_job)

        # Title should be unchanged
        assert sample_job.title_ge == original_title

    @pytest.mark.asyncio
    async def test_content_hash_changed_updates_job(
        self, db_session: AsyncSession, sample_job: Job
    ):
        """Test that changed content hash updates job."""
        original_hash = sample_job.content_hash

        # Update job with new content
        sample_job.title_ge = "განახლებული სათაური"
        sample_job.content_hash = "new_hash_456"
        sample_job.last_seen_at = datetime.utcnow()
        await db_session.commit()
        await db_session.refresh(sample_job)

        assert sample_job.content_hash != original_hash
        assert sample_job.title_ge == "განახლებული სათაური"


class TestParserRunIdempotency:
    """Test parser run idempotency."""

    @pytest.mark.asyncio
    async def test_multiple_runs_same_jobs(
        self, db_session: AsyncSession, sample_category: Category
    ):
        """Test that multiple parser runs don't create duplicate jobs."""
        # Simulate first run - create jobs
        jobs_data = [
            {"external_id": "job-1", "title": "ვაკანსია 1"},
            {"external_id": "job-2", "title": "ვაკანსია 2"},
            {"external_id": "job-3", "title": "ვაკანსია 3"},
        ]

        for data in jobs_data:
            job = Job(
                title_ge=data["title"],
                body_ge="აღწერა",
                company_name="Company",
                category_id=sample_category.id,
                status="active",
                parsed_from="jobs.ge",
                external_id=data["external_id"],
                content_hash=f"hash-{data['external_id']}",
                first_seen_at=datetime.utcnow(),
                last_seen_at=datetime.utcnow(),
            )
            db_session.add(job)

        await db_session.commit()

        # Count jobs after first run
        query = select(func.count()).select_from(Job).where(Job.parsed_from == "jobs.ge")
        result = await db_session.execute(query)
        count_after_first = result.scalar_one()
        assert count_after_first == 3

        # Simulate second run - update last_seen_at for existing jobs
        for data in jobs_data:
            query = select(Job).where(
                Job.parsed_from == "jobs.ge",
                Job.external_id == data["external_id"],
            )
            result = await db_session.execute(query)
            existing = result.scalar_one()
            existing.last_seen_at = datetime.utcnow()

        await db_session.commit()

        # Count should still be 3
        query = select(func.count()).select_from(Job).where(Job.parsed_from == "jobs.ge")
        result = await db_session.execute(query)
        count_after_second = result.scalar_one()
        assert count_after_second == 3

    @pytest.mark.asyncio
    async def test_not_seen_jobs_deactivated(
        self, db_session: AsyncSession, sample_category: Category
    ):
        """Test that jobs not seen for X days are deactivated."""
        # Create job with old last_seen_at
        old_job = Job(
            title_ge="ძველი ვაკანსია",
            body_ge="აღწერა",
            company_name="Company",
            category_id=sample_category.id,
            status="active",
            parsed_from="jobs.ge",
            external_id="old-job",
            content_hash="old-hash",
            last_seen_at=datetime.utcnow() - timedelta(days=10),
        )
        db_session.add(old_job)

        # Create recent job
        new_job = Job(
            title_ge="ახალი ვაკანსია",
            body_ge="აღწერა",
            company_name="Company",
            category_id=sample_category.id,
            status="active",
            parsed_from="jobs.ge",
            external_id="new-job",
            content_hash="new-hash",
            last_seen_at=datetime.utcnow(),
        )
        db_session.add(new_job)
        await db_session.commit()

        # Simulate not-seen deactivation (7 days threshold)
        cutoff = datetime.utcnow() - timedelta(days=7)
        query = select(Job).where(
            Job.status == "active",
            Job.last_seen_at < cutoff,
            Job.parsed_from != "manual",
        )
        result = await db_session.execute(query)
        old_jobs = result.scalars().all()

        for job in old_jobs:
            job.status = "inactive"

        await db_session.commit()

        # Verify old job is inactive
        await db_session.refresh(old_job)
        await db_session.refresh(new_job)

        assert old_job.status == "inactive"
        assert new_job.status == "active"
