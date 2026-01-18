"""Failure mode tests for API and parser.

P2-05.2: Tests to ensure proper error handling:
- Invalid input handling
- Missing required fields
- Database constraint violations
- Authentication failures
- Rate limiting behavior
"""
import pytest
from uuid import uuid4

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Job, Category


class TestAPIFailureModes:
    """Test API error handling."""

    @pytest.mark.asyncio
    async def test_job_not_found(self, client: AsyncClient):
        """Test 404 response for non-existent job."""
        fake_id = str(uuid4())
        response = await client.get(f"/api/v1/jobs/{fake_id}")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_invalid_uuid_format(self, client: AsyncClient):
        """Test error response for invalid UUID."""
        response = await client.get("/api/v1/jobs/not-a-valid-uuid")

        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_admin_without_api_key(self, client: AsyncClient):
        """Test 401 response when API key is missing."""
        response = await client.post(
            "/api/v1/admin/jobs",
            json={"title_ge": "Test", "body_ge": "Test"},
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_with_invalid_api_key(self, client: AsyncClient):
        """Test 403 response with invalid API key."""
        response = await client.post(
            "/api/v1/admin/jobs",
            json={"title_ge": "Test", "body_ge": "Test"},
            headers={"X-API-Key": "wrong-key"},
        )

        assert response.status_code in [401, 403]

    @pytest.mark.asyncio
    async def test_create_job_missing_required_fields(
        self, client: AsyncClient, admin_headers: dict
    ):
        """Test validation error for missing required fields."""
        response = await client.post(
            "/api/v1/admin/jobs",
            json={"title_ge": "Test"},  # Missing body_ge and category_id
            headers=admin_headers,
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_job_invalid_category(
        self, client: AsyncClient, admin_headers: dict
    ):
        """Test error when referencing non-existent category."""
        fake_category_id = str(uuid4())
        response = await client.post(
            "/api/v1/admin/jobs",
            json={
                "title_ge": "Test Job",
                "body_ge": "Test description",
                "company_name": "Test Co",
                "category_id": fake_category_id,
            },
            headers=admin_headers,
        )

        # Should fail due to foreign key constraint or validation
        assert response.status_code in [400, 422, 500]

    @pytest.mark.asyncio
    async def test_pagination_invalid_page(self, client: AsyncClient):
        """Test error for invalid pagination parameters."""
        response = await client.get("/api/v1/jobs?page=0")  # Page must be >= 1

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_pagination_negative_page_size(self, client: AsyncClient):
        """Test error for negative page size."""
        response = await client.get("/api/v1/jobs?page_size=-1")

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_filter_invalid_status(self, client: AsyncClient):
        """Test handling of invalid status filter."""
        response = await client.get("/api/v1/jobs?status=invalid_status")

        # Should either ignore invalid filter or return empty results
        assert response.status_code == 200


class TestDatabaseFailureModes:
    """Test database error handling."""

    @pytest.mark.asyncio
    async def test_unique_constraint_violation(
        self, db_session: AsyncSession, sample_category: Category
    ):
        """Test handling of unique constraint violation."""
        # Create first job
        job1 = Job(
            title_ge="ვაკანსია",
            body_ge="აღწერა",
            company_name="Company",
            category_id=sample_category.id,
            status="active",
            parsed_from="test",
            external_id="unique-test",
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
            parsed_from="test",
            external_id="unique-test",  # Same external_id
            content_hash="hash2",
        )
        db_session.add(job2)

        with pytest.raises(Exception):
            await db_session.commit()

        # Rollback to continue other tests
        await db_session.rollback()

    @pytest.mark.asyncio
    async def test_null_required_field(
        self, db_session: AsyncSession, sample_category: Category
    ):
        """Test error when required field is null."""
        job = Job(
            title_ge=None,  # Required field
            body_ge="აღწერა",
            company_name="Company",
            category_id=sample_category.id,
        )
        db_session.add(job)

        with pytest.raises(Exception):
            await db_session.commit()

        await db_session.rollback()


class TestParserFailureModes:
    """Test parser error handling."""

    @pytest.mark.asyncio
    async def test_parser_run_trigger_invalid_source(
        self, client: AsyncClient, admin_headers: dict
    ):
        """Test triggering parser with invalid source."""
        response = await client.post(
            "/api/v1/admin/parser/trigger",
            json={
                "source": "invalid-source",
                "regions": ["tbilisi"],
            },
            headers=admin_headers,
        )

        # Should either reject or create run with unknown source
        assert response.status_code in [200, 400, 422]

    @pytest.mark.asyncio
    async def test_cancel_nonexistent_run(
        self, client: AsyncClient, admin_headers: dict
    ):
        """Test cancelling a non-existent parser run."""
        fake_id = str(uuid4())
        response = await client.delete(
            f"/api/v1/admin/parser/runs/{fake_id}",
            headers=admin_headers,
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_parser_sources_endpoint(
        self, client: AsyncClient, admin_headers: dict
    ):
        """Test parser sources endpoint returns valid data."""
        response = await client.get(
            "/api/v1/admin/parser/sources",
            headers=admin_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestInputSanitization:
    """Test input sanitization and XSS prevention."""

    @pytest.mark.asyncio
    async def test_search_with_special_characters(self, client: AsyncClient):
        """Test search handles special characters safely."""
        # SQL injection attempt
        response = await client.get("/api/v1/jobs?q=' OR 1=1 --")
        assert response.status_code == 200

        # XSS attempt
        response = await client.get("/api/v1/jobs?q=<script>alert('xss')</script>")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_category_filter_injection(self, client: AsyncClient):
        """Test category filter handles malicious input."""
        response = await client.get("/api/v1/jobs?category='; DROP TABLE jobs; --")
        assert response.status_code == 200
        # Should return empty results, not error

    @pytest.mark.asyncio
    async def test_long_search_query(self, client: AsyncClient):
        """Test handling of very long search queries."""
        long_query = "a" * 10000
        response = await client.get(f"/api/v1/jobs?q={long_query}")

        # Should handle gracefully
        assert response.status_code in [200, 400, 422]
