"""Unit tests for parser adapters."""
import pytest
from app.parsers.jobs_ge import JobsGeAdapter


class TestJobsGeAdapter:
    """Tests for jobs.ge parser adapter."""

    @pytest.fixture
    def adapter(self) -> JobsGeAdapter:
        """Create a JobsGeAdapter instance."""
        return JobsGeAdapter()

    def test_extract_id_from_url_standard(self, adapter: JobsGeAdapter):
        """Test extracting job ID from standard jobs.ge URL."""
        url = "https://jobs.ge/ge/?view=jobs&id=12345"
        assert adapter._extract_id_from_url(url) == "12345"

    def test_extract_id_from_url_relative(self, adapter: JobsGeAdapter):
        """Test extracting job ID from relative URL."""
        url = "/ge/?view=jobs&id=67890"
        assert adapter._extract_id_from_url(url) == "67890"

    def test_extract_id_from_url_legacy_format(self, adapter: JobsGeAdapter):
        """Test extracting job ID from legacy URL format."""
        url = "https://jobs.ge/ge/11111"
        assert adapter._extract_id_from_url(url) == "11111"

    def test_extract_id_from_url_invalid(self, adapter: JobsGeAdapter):
        """Test extracting job ID from invalid URL returns None."""
        url = "https://jobs.ge/ge/?view=company"
        assert adapter._extract_id_from_url(url) is None

    def test_extract_jobs_from_list(
        self, adapter: JobsGeAdapter, mock_jobs_ge_list_html: str
    ):
        """Test extracting jobs from list page HTML."""
        jobs = adapter._extract_jobs_from_list(mock_jobs_ge_list_html)

        assert len(jobs) == 3
        assert jobs[0]["external_id"] == "12345"
        assert jobs[0]["title"] == "პროგრამისტი / Developer"
        assert jobs[0]["company_name"] == "TechCorp"
        assert jobs[0]["is_vip"] is False

        # VIP job
        assert jobs[1]["external_id"] == "67890"
        assert jobs[1]["is_vip"] is True

    def test_parse_detail_page(
        self, adapter: JobsGeAdapter, mock_jobs_ge_detail_html: str
    ):
        """Test parsing job details from detail page HTML."""
        job_data = adapter._parse_detail_page(
            mock_jobs_ge_detail_html, "https://jobs.ge/ge/?view=jobs&id=12345"
        )

        assert job_data is not None
        assert job_data.external_id == "12345"
        assert "პროგრამისტი" in job_data.title_ge
        assert job_data.has_salary is True
        assert job_data.salary_min == 3000
        assert job_data.salary_max == 5000
        assert job_data.salary_currency == "GEL"
        assert job_data.content_hash is not None

    def test_parse_detail_page_no_salary(
        self, adapter: JobsGeAdapter, mock_jobs_ge_detail_no_salary_html: str
    ):
        """Test parsing job details when salary is not specified."""
        job_data = adapter._parse_detail_page(
            mock_jobs_ge_detail_no_salary_html,
            "https://jobs.ge/ge/?view=jobs&id=99999",
        )

        assert job_data is not None
        assert "დიზაინერი" in job_data.title_ge
        assert job_data.has_salary is False
        assert job_data.salary_min is None

    def test_map_region_georgian(self, adapter: JobsGeAdapter):
        """Test mapping Georgian region names."""
        assert adapter.map_region("თბილისი") == "tbilisi"
        assert adapter.map_region("ბათუმი") == "batumi"
        assert adapter.map_region("ქუთაისი") == "kutaisi"

    def test_map_region_english(self, adapter: JobsGeAdapter):
        """Test mapping English region names."""
        assert adapter.map_region("Tbilisi") == "tbilisi"
        assert adapter.map_region("Batumi") == "batumi"

    def test_map_region_unknown(self, adapter: JobsGeAdapter):
        """Test mapping unknown region returns None."""
        assert adapter.map_region("Unknown City") is None

    def test_adapter_properties(self, adapter: JobsGeAdapter):
        """Test adapter configuration properties."""
        assert adapter.source_name == "jobs.ge"
        assert adapter.source_domain == "jobs.ge"
        assert adapter.base_url == "https://jobs.ge"
        assert adapter.rate_limit_delay >= 1.0  # Should have reasonable delay


class TestJobsGeAdapterEdgeCases:
    """Edge case tests for jobs.ge parser."""

    @pytest.fixture
    def adapter(self) -> JobsGeAdapter:
        return JobsGeAdapter()

    def test_extract_jobs_empty_html(self, adapter: JobsGeAdapter):
        """Test extracting jobs from empty HTML."""
        jobs = adapter._extract_jobs_from_list("<html><body></body></html>")
        assert jobs == []

    def test_extract_jobs_malformed_html(self, adapter: JobsGeAdapter):
        """Test extracting jobs from malformed HTML."""
        jobs = adapter._extract_jobs_from_list("<html><body><a href='broken")
        assert jobs == []

    def test_parse_detail_page_empty(self, adapter: JobsGeAdapter):
        """Test parsing empty detail page returns None."""
        result = adapter._parse_detail_page(
            "<html><body></body></html>",
            "https://jobs.ge/ge/?view=jobs&id=1",
        )
        assert result is None

    def test_parse_detail_page_no_title(self, adapter: JobsGeAdapter):
        """Test parsing detail page without title returns None."""
        html = """
        <html>
        <body>
            <div class="description">Some content without title</div>
        </body>
        </html>
        """
        result = adapter._parse_detail_page(
            html, "https://jobs.ge/ge/?view=jobs&id=1"
        )
        assert result is None

    def test_salary_extraction_usd(self, adapter: JobsGeAdapter):
        """Test extracting salary in USD."""
        html = """
        <html>
        <head><title>Developer</title></head>
        <body>
            <h1>Senior Developer Position</h1>
            <div class="description">
                <p>Great opportunity for experienced developers.</p>
                <p>Salary: 2000 - 3500 USD per month</p>
                <p>Requirements: Python, FastAPI experience required for this role.</p>
            </div>
        </body>
        </html>
        """
        result = adapter._parse_detail_page(
            html, "https://jobs.ge/ge/?view=jobs&id=1"
        )
        assert result is not None
        assert result.has_salary is True
        assert result.salary_currency == "USD"

    def test_salary_extraction_eur(self, adapter: JobsGeAdapter):
        """Test extracting salary in EUR."""
        html = """
        <html>
        <head><title>Manager</title></head>
        <body>
            <h1>Project Manager Position</h1>
            <div class="description">
                <p>International company is hiring.</p>
                <p>3000 EUR</p>
                <p>Join our amazing team and work on exciting projects.</p>
            </div>
        </body>
        </html>
        """
        result = adapter._parse_detail_page(
            html, "https://jobs.ge/ge/?view=jobs&id=2"
        )
        assert result is not None
        assert result.has_salary is True
        assert result.salary_currency == "EUR"

    def test_duplicate_job_filtering(self, adapter: JobsGeAdapter):
        """Test that duplicate job IDs are filtered out from list."""
        html = """
        <html>
        <body>
            <a href="/ge/?view=jobs&id=12345">Job 1</a>
            <a href="/ge/?view=jobs&id=12345">Job 1 Duplicate</a>
            <a href="/ge/?view=jobs&id=67890">Job 2</a>
        </body>
        </html>
        """
        jobs = adapter._extract_jobs_from_list(html)
        assert len(jobs) == 2
        ids = [j["external_id"] for j in jobs]
        assert ids == ["12345", "67890"]
