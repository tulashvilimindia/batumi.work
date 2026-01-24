"""Tests for the parser components."""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

from app.parser.client import HRGeClient
from app.parser.sitemap import SitemapParser
from app.utils.helpers import parse_datetime, clean_html, truncate_string


class TestHRGeClient:
    """Test HR.GE API client."""

    @pytest.mark.asyncio
    async def test_client_initialization(self):
        """Test client initializes correctly."""
        client = HRGeClient()
        assert client.base_url is not None
        assert client.rate_limit > 0

    @pytest.mark.asyncio
    async def test_get_job_not_found(self):
        """Test getting a job that doesn't exist."""
        client = HRGeClient()

        with patch.object(client, "_request", new_callable=AsyncMock) as mock_request:
            from httpx import HTTPStatusError, Response, Request

            mock_response = MagicMock(spec=Response)
            mock_response.status_code = 404
            mock_request.side_effect = HTTPStatusError(
                "Not Found",
                request=MagicMock(spec=Request),
                response=mock_response,
            )

            result = await client.get_job(99999999)
            assert result is None


class TestSitemapParser:
    """Test sitemap parser."""

    def test_parse_job_ids_from_xml(self):
        """Test parsing job IDs from sitemap XML."""
        parser = SitemapParser()

        sample_xml = """<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url><loc>https://hr.ge/job/123456-test-job</loc></url>
            <url><loc>https://hr.ge/job/789012-another-job</loc></url>
            <url><loc>https://hr.ge/company/some-company</loc></url>
        </urlset>
        """

        job_ids = parser.parse_job_ids(sample_xml)

        assert 123456 in job_ids
        assert 789012 in job_ids
        assert len(job_ids) == 2

    def test_parse_empty_sitemap(self):
        """Test parsing empty sitemap."""
        parser = SitemapParser()

        empty_xml = """<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        </urlset>
        """

        job_ids = parser.parse_job_ids(empty_xml)
        assert len(job_ids) == 0


class TestHelpers:
    """Test utility helper functions."""

    def test_parse_datetime_iso_format(self):
        """Test parsing ISO datetime format."""
        result = parse_datetime("2024-01-15T10:30:00Z")
        assert result is not None
        assert result.year == 2024
        assert result.month == 1
        assert result.day == 15

    def test_parse_datetime_with_milliseconds(self):
        """Test parsing datetime with milliseconds."""
        result = parse_datetime("2024-01-15T10:30:00.123Z")
        assert result is not None

    def test_parse_datetime_date_only(self):
        """Test parsing date-only format."""
        result = parse_datetime("2024-01-15")
        assert result is not None
        assert result.year == 2024

    def test_parse_datetime_none(self):
        """Test parsing None returns None."""
        result = parse_datetime(None)
        assert result is None

    def test_parse_datetime_invalid(self):
        """Test parsing invalid datetime returns None."""
        result = parse_datetime("not-a-date")
        assert result is None

    def test_clean_html_basic(self):
        """Test cleaning basic HTML."""
        html = "<p>Hello <strong>World</strong></p>"
        result = clean_html(html)
        assert result == "Hello World"

    def test_clean_html_with_whitespace(self):
        """Test cleaning HTML with extra whitespace."""
        html = "<p>Hello</p>    <p>World</p>"
        result = clean_html(html)
        assert "Hello" in result
        assert "World" in result

    def test_clean_html_none(self):
        """Test cleaning None returns None."""
        result = clean_html(None)
        assert result is None

    def test_truncate_string_short(self):
        """Test truncating a short string."""
        result = truncate_string("Hello", 10)
        assert result == "Hello"

    def test_truncate_string_long(self):
        """Test truncating a long string."""
        result = truncate_string("Hello World This Is A Long String", 10)
        assert len(result) == 10
        assert result.endswith("...")

    def test_truncate_string_none(self):
        """Test truncating None returns None."""
        result = truncate_string(None)
        assert result is None
