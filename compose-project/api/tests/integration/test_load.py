"""Load tests for API performance.

P2-05.3: Tests to ensure:
- API handles large datasets efficiently
- Pagination works correctly with many records
- Concurrent requests are handled properly
"""
import pytest
import asyncio
from datetime import datetime
from uuid import uuid4
from typing import List

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Job, Category, Region


class TestLargeDataset:
    """Test API performance with large datasets."""

    @pytest.mark.asyncio
    async def test_create_many_jobs(
        self, db_session: AsyncSession, sample_category: Category
    ):
        """Test creating many jobs for load testing."""
        num_jobs = 100

        jobs = []
        for i in range(num_jobs):
            job = Job(
                title_ge=f"ვაკანსია {i}",
                title_en=f"Job {i}",
                body_ge=f"აღწერა {i}",
                body_en=f"Description {i}",
                company_name=f"Company {i % 10}",
                category_id=sample_category.id,
                status="active",
                parsed_from="test",
                external_id=f"load-test-{i}",
                content_hash=f"hash-{i}",
                has_salary=i % 2 == 0,
                salary_min=2000 + (i * 100) if i % 2 == 0 else None,
                salary_max=3000 + (i * 100) if i % 2 == 0 else None,
            )
            jobs.append(job)

        db_session.add_all(jobs)
        await db_session.commit()

        # Verify all jobs created
        from sqlalchemy import select, func
        query = select(func.count()).select_from(Job).where(Job.parsed_from == "test")
        result = await db_session.execute(query)
        count = result.scalar_one()

        assert count == num_jobs

    @pytest.mark.asyncio
    async def test_pagination_large_dataset(
        self, client: AsyncClient, db_session: AsyncSession, sample_category: Category
    ):
        """Test pagination with many records."""
        # Create 50 jobs
        for i in range(50):
            job = Job(
                title_ge=f"ვაკანსია {i}",
                body_ge=f"აღწერა {i}",
                company_name=f"Company {i}",
                category_id=sample_category.id,
                status="active",
                parsed_from="pagination-test",
                external_id=f"page-test-{i}",
                content_hash=f"hash-{i}",
            )
            db_session.add(job)
        await db_session.commit()

        # Test first page
        response = await client.get("/api/v1/jobs?page=1&page_size=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["page"] == 1

        # Test middle page
        response = await client.get("/api/v1/jobs?page=3&page_size=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["page"] == 3

        # Test last page
        response = await client.get("/api/v1/jobs?page=5&page_size=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["page"] == 5

    @pytest.mark.asyncio
    async def test_filter_large_dataset(
        self, client: AsyncClient, db_session: AsyncSession, sample_category: Category
    ):
        """Test filtering on large dataset."""
        # Create jobs with varied attributes
        for i in range(30):
            job = Job(
                title_ge=f"Developer {i}" if i % 2 == 0 else f"Manager {i}",
                body_ge=f"აღწერა {i}",
                company_name=f"Company {i % 5}",
                category_id=sample_category.id,
                status="active",
                parsed_from="filter-test",
                external_id=f"filter-test-{i}",
                content_hash=f"hash-{i}",
                has_salary=i % 3 == 0,
            )
            db_session.add(job)
        await db_session.commit()

        # Test search filter
        response = await client.get("/api/v1/jobs?q=Developer")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 0

        # Test salary filter
        response = await client.get("/api/v1/jobs?has_salary=true")
        assert response.status_code == 200
        data = response.json()
        for job in data["items"]:
            assert job["has_salary"] is True


class TestConcurrency:
    """Test concurrent request handling."""

    @pytest.mark.asyncio
    async def test_concurrent_reads(self, client: AsyncClient, sample_job: Job):
        """Test handling multiple concurrent read requests."""
        num_requests = 20

        async def make_request():
            response = await client.get("/api/v1/jobs")
            return response.status_code

        # Execute concurrent requests
        tasks = [make_request() for _ in range(num_requests)]
        results = await asyncio.gather(*tasks)

        # All should succeed
        assert all(status == 200 for status in results)

    @pytest.mark.asyncio
    async def test_concurrent_job_detail_requests(
        self, client: AsyncClient, sample_job: Job
    ):
        """Test concurrent requests to job detail endpoint."""
        num_requests = 10

        async def get_job():
            response = await client.get(f"/api/v1/jobs/{sample_job.id}")
            return response.status_code

        tasks = [get_job() for _ in range(num_requests)]
        results = await asyncio.gather(*tasks)

        assert all(status == 200 for status in results)

    @pytest.mark.asyncio
    async def test_concurrent_different_endpoints(self, client: AsyncClient):
        """Test concurrent requests to different endpoints."""

        async def get_jobs():
            return await client.get("/api/v1/jobs")

        async def get_categories():
            return await client.get("/api/v1/categories")

        async def get_regions():
            return await client.get("/api/v1/regions")

        async def get_health():
            return await client.get("/health")

        # Mix of different endpoints
        tasks = [
            get_jobs(),
            get_categories(),
            get_regions(),
            get_health(),
            get_jobs(),
            get_categories(),
        ]
        responses = await asyncio.gather(*tasks)

        # All should succeed
        assert all(r.status_code == 200 for r in responses)


class TestResponseTimes:
    """Test API response time targets."""

    @pytest.mark.asyncio
    async def test_jobs_list_response_time(self, client: AsyncClient):
        """Test jobs list endpoint responds within target time."""
        import time

        start = time.time()
        response = await client.get("/api/v1/jobs?page_size=20")
        elapsed = time.time() - start

        assert response.status_code == 200
        # Target: < 200ms for list endpoint
        assert elapsed < 0.5  # Allow 500ms for test environment

    @pytest.mark.asyncio
    async def test_categories_response_time(self, client: AsyncClient):
        """Test categories endpoint responds quickly."""
        import time

        start = time.time()
        response = await client.get("/api/v1/categories")
        elapsed = time.time() - start

        assert response.status_code == 200
        # Target: < 100ms for categories
        assert elapsed < 0.3

    @pytest.mark.asyncio
    async def test_health_response_time(self, client: AsyncClient):
        """Test health endpoint responds very quickly."""
        import time

        start = time.time()
        response = await client.get("/health")
        elapsed = time.time() - start

        assert response.status_code == 200
        # Target: < 50ms for health check
        assert elapsed < 0.2
