"""
Comprehensive E2E Tests for Admin Console API

Tests cover:
- Health checks
- Dashboard API
- Jobs management
- Parser management (stats, progress, jobs, controls)
- Analytics (overview, salary, trends)
- Database browser
- Backups
- Logs

Run with: pytest test_e2e_admin.py -v --tb=short
"""

import pytest
import httpx
import asyncio
from datetime import datetime, timedelta
from typing import Optional
import json

# Configuration
BASE_URL = "http://38.242.143.10:9000"
TIMEOUT = 30.0


class TestConfig:
    """Test configuration and utilities."""

    @staticmethod
    def get_client():
        return httpx.AsyncClient(base_url=BASE_URL, timeout=TIMEOUT)


# ============================================================================
# HEALTH CHECK TESTS
# ============================================================================

class TestHealthEndpoints:
    """Test health check endpoints."""

    @pytest.mark.asyncio
    async def test_health_check_returns_200(self):
        """Positive: Health endpoint returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/health")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_health_check_returns_healthy_status(self):
        """Positive: Health response contains healthy status."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/health")
            data = response.json()
            assert data["status"] == "healthy"
            assert data["service"] == "admin"

    @pytest.mark.asyncio
    async def test_health_check_has_version(self):
        """Positive: Health response includes version."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/health")
            data = response.json()
            assert "version" in data


# ============================================================================
# DASHBOARD TESTS
# ============================================================================

class TestDashboardEndpoints:
    """Test dashboard API endpoints."""

    @pytest.mark.asyncio
    async def test_dashboard_returns_200(self):
        """Positive: Dashboard endpoint returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/dashboard")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_dashboard_has_stats(self):
        """Positive: Dashboard contains stats object."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/dashboard")
            data = response.json()
            assert "stats" in data
            assert "total_jobs" in data["stats"]
            assert "active_jobs" in data["stats"]

    @pytest.mark.asyncio
    async def test_dashboard_stats_are_numbers(self):
        """Positive: Dashboard stats are numeric values."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/dashboard")
            data = response.json()
            assert isinstance(data["stats"]["total_jobs"], int)
            assert isinstance(data["stats"]["active_jobs"], int)
            assert data["stats"]["total_jobs"] >= 0

    @pytest.mark.asyncio
    async def test_dashboard_has_by_region(self):
        """Positive: Dashboard contains by_region data."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/dashboard")
            data = response.json()
            assert "by_region" in data
            assert isinstance(data["by_region"], list)

    @pytest.mark.asyncio
    async def test_dashboard_has_by_category(self):
        """Positive: Dashboard contains by_category data."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/dashboard")
            data = response.json()
            assert "by_category" in data
            assert isinstance(data["by_category"], list)


# ============================================================================
# JOBS API TESTS
# ============================================================================

class TestJobsEndpoints:
    """Test jobs management endpoints."""

    @pytest.mark.asyncio
    async def test_jobs_list_returns_200(self):
        """Positive: Jobs list returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/jobs")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_jobs_list_has_pagination(self):
        """Positive: Jobs list includes pagination info."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/jobs")
            data = response.json()
            assert "items" in data
            assert "total" in data
            assert "page" in data
            assert "page_size" in data

    @pytest.mark.asyncio
    async def test_jobs_list_with_limit(self):
        """Positive: Jobs list respects limit parameter."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/jobs?limit=5")
            data = response.json()
            assert len(data["items"]) <= 5

    @pytest.mark.asyncio
    async def test_jobs_list_with_status_filter(self):
        """Positive: Jobs list filters by status."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/jobs?status=active")
            data = response.json()
            for job in data["items"]:
                assert job["status"] == "active"

    @pytest.mark.asyncio
    async def test_jobs_list_items_have_required_fields(self):
        """Positive: Job items have all required fields."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/jobs?limit=1")
            data = response.json()
            if data["items"]:
                job = data["items"][0]
                required_fields = ["id", "title_ge", "status", "created_at"]
                for field in required_fields:
                    assert field in job, f"Missing field: {field}"

    @pytest.mark.asyncio
    async def test_jobs_list_negative_limit(self):
        """Negative: Jobs list with negative limit returns error or defaults."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/jobs?limit=-1")
            # Should either return 422 or use default limit
            assert response.status_code in [200, 422]

    @pytest.mark.asyncio
    async def test_jobs_list_invalid_status(self):
        """Negative: Jobs list with invalid status returns empty or all."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/jobs?status=invalid_status_xyz")
            assert response.status_code == 200
            data = response.json()
            # Should return empty list for invalid status
            assert "items" in data


# ============================================================================
# PARSER STATS TESTS
# ============================================================================

class TestParserStatsEndpoints:
    """Test parser statistics endpoints."""

    @pytest.mark.asyncio
    async def test_parser_stats_returns_200(self):
        """Positive: Parser stats returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/stats")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_parser_stats_has_totals(self):
        """Positive: Parser stats contains total counts."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/stats")
            data = response.json()
            assert "total_jobs" in data
            assert "total_regions" in data
            assert "total_categories" in data

    @pytest.mark.asyncio
    async def test_parser_stats_has_parsed_today(self):
        """Positive: Parser stats shows parsed today count."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/stats")
            data = response.json()
            assert "parsed_today" in data
            assert isinstance(data["parsed_today"], int)

    @pytest.mark.asyncio
    async def test_parser_stats_has_by_region(self):
        """Positive: Parser stats has region breakdown."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/stats")
            data = response.json()
            assert "by_region" in data
            assert isinstance(data["by_region"], list)
            if data["by_region"]:
                region = data["by_region"][0]
                assert "name_en" in region
                assert "count" in region

    @pytest.mark.asyncio
    async def test_parser_stats_has_by_category(self):
        """Positive: Parser stats has category breakdown."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/stats")
            data = response.json()
            assert "by_category" in data
            assert isinstance(data["by_category"], list)

    @pytest.mark.asyncio
    async def test_parser_stats_has_7day_stats(self):
        """Positive: Parser stats has 7-day statistics."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/stats")
            data = response.json()
            assert "parse_jobs_7d" in data
            stats_7d = data["parse_jobs_7d"]
            assert "total" in stats_7d
            assert "completed" in stats_7d


# ============================================================================
# PARSER PROGRESS TESTS
# ============================================================================

class TestParserProgressEndpoints:
    """Test parser progress tracking endpoints."""

    @pytest.mark.asyncio
    async def test_parser_progress_returns_200(self):
        """Positive: Parser progress returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/progress")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_parser_progress_has_running_flag(self):
        """Positive: Parser progress has running flag."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/progress")
            data = response.json()
            assert "running" in data
            assert isinstance(data["running"], bool)

    @pytest.mark.asyncio
    async def test_parser_progress_has_jobs_array(self):
        """Positive: Parser progress has jobs array."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/progress")
            data = response.json()
            assert "jobs" in data
            assert isinstance(data["jobs"], list)


# ============================================================================
# PARSER JOBS HISTORY TESTS
# ============================================================================

class TestParserJobsEndpoints:
    """Test parser job history endpoints."""

    @pytest.mark.asyncio
    async def test_parser_jobs_returns_200(self):
        """Positive: Parser jobs list returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/jobs")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_parser_jobs_has_pagination(self):
        """Positive: Parser jobs list has pagination."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/jobs")
            data = response.json()
            assert "jobs" in data
            assert "total" in data
            assert "limit" in data

    @pytest.mark.asyncio
    async def test_parser_jobs_with_limit(self):
        """Positive: Parser jobs respects limit."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/jobs?limit=3")
            data = response.json()
            assert len(data["jobs"]) <= 3

    @pytest.mark.asyncio
    async def test_parser_jobs_with_status_filter(self):
        """Positive: Parser jobs filters by status."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/jobs?status=completed")
            data = response.json()
            for job in data["jobs"]:
                assert job["status"] == "completed"

    @pytest.mark.asyncio
    async def test_parser_job_has_required_fields(self):
        """Positive: Parser job has required fields."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/jobs?limit=1")
            data = response.json()
            if data["jobs"]:
                job = data["jobs"][0]
                required = ["id", "status", "source", "progress", "timing"]
                for field in required:
                    assert field in job, f"Missing field: {field}"

    @pytest.mark.asyncio
    async def test_parser_job_detail_returns_200(self):
        """Positive: Parser job detail returns 200 OK."""
        async with TestConfig.get_client() as client:
            # First get a job ID
            list_response = await client.get("/api/parser/jobs?limit=1")
            data = list_response.json()
            if data["jobs"]:
                job_id = data["jobs"][0]["id"]
                response = await client.get(f"/api/parser/jobs/{job_id}")
                assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_parser_job_detail_with_items(self):
        """Positive: Parser job detail can include items."""
        async with TestConfig.get_client() as client:
            list_response = await client.get("/api/parser/jobs?limit=1")
            data = list_response.json()
            if data["jobs"]:
                job_id = data["jobs"][0]["id"]
                response = await client.get(f"/api/parser/jobs/{job_id}?include_items=true")
                assert response.status_code == 200
                detail = response.json()
                assert "items" in detail

    @pytest.mark.asyncio
    async def test_parser_job_detail_with_logs(self):
        """Positive: Parser job detail can include logs."""
        async with TestConfig.get_client() as client:
            list_response = await client.get("/api/parser/jobs?limit=1")
            data = list_response.json()
            if data["jobs"]:
                job_id = data["jobs"][0]["id"]
                response = await client.get(f"/api/parser/jobs/{job_id}?include_logs=true")
                assert response.status_code == 200
                detail = response.json()
                assert "logs" in detail

    @pytest.mark.asyncio
    async def test_parser_job_not_found(self):
        """Negative: Non-existent job returns 404."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/jobs/00000000-0000-0000-0000-000000000000")
            assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_parser_job_invalid_uuid(self):
        """Negative: Invalid UUID returns 422."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/jobs/invalid-uuid")
            assert response.status_code in [404, 422, 500]


# ============================================================================
# PARSER CONFIG TESTS
# ============================================================================

class TestParserConfigEndpoints:
    """Test parser configuration endpoints."""

    @pytest.mark.asyncio
    async def test_parser_config_returns_200(self):
        """Positive: Parser config returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/config")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_parser_config_has_regions(self):
        """Positive: Parser config has regions list."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/config")
            data = response.json()
            assert "regions" in data
            assert isinstance(data["regions"], list)
            assert len(data["regions"]) > 0

    @pytest.mark.asyncio
    async def test_parser_config_has_categories(self):
        """Positive: Parser config has categories list."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/config")
            data = response.json()
            assert "categories" in data
            assert isinstance(data["categories"], list)
            assert len(data["categories"]) > 0

    @pytest.mark.asyncio
    async def test_parser_config_has_sources(self):
        """Positive: Parser config has sources list."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/parser/config")
            data = response.json()
            assert "sources" in data
            assert "jobs.ge" in data["sources"]


# ============================================================================
# PARSER JOB CONTROL TESTS
# ============================================================================

class TestParserJobControlEndpoints:
    """Test parser job control endpoints."""

    @pytest.mark.asyncio
    async def test_parser_control_invalid_action(self):
        """Negative: Invalid action returns 400."""
        async with TestConfig.get_client() as client:
            list_response = await client.get("/api/parser/jobs?limit=1")
            data = list_response.json()
            if data["jobs"]:
                job_id = data["jobs"][0]["id"]
                response = await client.post(
                    f"/api/parser/jobs/{job_id}/control",
                    json={"action": "invalid_action"}
                )
                assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_parser_control_missing_action(self):
        """Negative: Missing action returns 422."""
        async with TestConfig.get_client() as client:
            list_response = await client.get("/api/parser/jobs?limit=1")
            data = list_response.json()
            if data["jobs"]:
                job_id = data["jobs"][0]["id"]
                response = await client.post(
                    f"/api/parser/jobs/{job_id}/control",
                    json={}
                )
                assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_parser_control_nonexistent_job(self):
        """Negative: Control on non-existent job."""
        async with TestConfig.get_client() as client:
            response = await client.post(
                "/api/parser/jobs/00000000-0000-0000-0000-000000000000/control",
                json={"action": "pause"}
            )
            # Should handle gracefully
            assert response.status_code in [200, 404]


# ============================================================================
# ANALYTICS TESTS
# ============================================================================

class TestAnalyticsEndpoints:
    """Test analytics endpoints."""

    @pytest.mark.asyncio
    async def test_analytics_overview_returns_200(self):
        """Positive: Analytics overview returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/analytics/overview")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_analytics_overview_has_totals(self):
        """Positive: Analytics overview has total counts."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/analytics/overview")
            data = response.json()
            assert "total_jobs" in data
            assert "active_jobs" in data
            assert "with_salary" in data

    @pytest.mark.asyncio
    async def test_analytics_overview_has_by_status(self):
        """Positive: Analytics overview has status breakdown."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/analytics/overview")
            data = response.json()
            assert "by_status" in data

    @pytest.mark.asyncio
    async def test_analytics_salary_returns_200(self):
        """Positive: Salary analytics returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/analytics/salary")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_analytics_salary_has_average(self):
        """Positive: Salary analytics has average values."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/analytics/salary")
            data = response.json()
            assert "average" in data
            assert "min" in data["average"]
            assert "max" in data["average"]

    @pytest.mark.asyncio
    async def test_analytics_salary_has_range(self):
        """Positive: Salary analytics has range values."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/analytics/salary")
            data = response.json()
            assert "range" in data

    @pytest.mark.asyncio
    async def test_analytics_salary_has_distribution(self):
        """Positive: Salary analytics has distribution."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/analytics/salary")
            data = response.json()
            assert "distribution" in data
            assert isinstance(data["distribution"], list)

    @pytest.mark.asyncio
    async def test_analytics_trends_returns_200(self):
        """Positive: Trends analytics returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/analytics/trends")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_analytics_trends_has_by_day(self):
        """Positive: Trends has daily breakdown."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/analytics/trends")
            data = response.json()
            assert "by_day" in data
            assert isinstance(data["by_day"], list)

    @pytest.mark.asyncio
    async def test_analytics_trends_has_top_companies(self):
        """Positive: Trends has top companies."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/analytics/trends")
            data = response.json()
            assert "top_companies" in data
            assert isinstance(data["top_companies"], list)


# ============================================================================
# DATABASE TESTS
# ============================================================================

class TestDatabaseEndpoints:
    """Test database browser endpoints."""

    @pytest.mark.asyncio
    async def test_database_tables_returns_200(self):
        """Positive: Database tables returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/database/tables")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_database_tables_has_list(self):
        """Positive: Database tables returns list."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/database/tables")
            data = response.json()
            assert "tables" in data
            assert isinstance(data["tables"], list)

    @pytest.mark.asyncio
    async def test_database_tables_has_row_counts(self):
        """Positive: Database tables include row counts."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/database/tables")
            data = response.json()
            if data["tables"]:
                table = data["tables"][0]
                assert "name" in table
                assert "row_count" in table

    @pytest.mark.asyncio
    async def test_database_has_jobs_table(self):
        """Positive: Database has jobs table."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/database/tables")
            data = response.json()
            table_names = [t["name"] for t in data["tables"]]
            assert "jobs" in table_names

    @pytest.mark.asyncio
    async def test_database_table_info_returns_200(self):
        """Positive: Table info returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/database/tables/jobs")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_database_table_info_nonexistent(self):
        """Negative: Non-existent table returns 404."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/database/tables/nonexistent_table_xyz")
            assert response.status_code == 404


# ============================================================================
# BACKUP TESTS
# ============================================================================

class TestBackupEndpoints:
    """Test backup management endpoints."""

    @pytest.mark.asyncio
    async def test_backups_list_returns_200(self):
        """Positive: Backups list returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/backups")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_backups_list_has_structure(self):
        """Positive: Backups list has proper structure."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/backups")
            data = response.json()
            assert "backups" in data
            assert "total" in data
            assert isinstance(data["backups"], list)

    @pytest.mark.asyncio
    async def test_backup_item_has_fields(self):
        """Positive: Backup items have required fields."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/backups")
            data = response.json()
            if data["backups"]:
                backup = data["backups"][0]
                assert "name" in backup
                assert "type" in backup
                assert "created_at" in backup


# ============================================================================
# LOGS TESTS
# ============================================================================

class TestLogsEndpoints:
    """Test container logs endpoints."""

    @pytest.mark.asyncio
    async def test_logs_worker_returns_200(self):
        """Positive: Worker logs returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/logs/worker")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_logs_worker_has_content(self):
        """Positive: Worker logs has content."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/logs/worker")
            data = response.json()
            assert "service" in data
            assert "lines" in data
            assert isinstance(data["lines"], list)

    @pytest.mark.asyncio
    async def test_logs_with_lines_param(self):
        """Positive: Logs respects lines parameter."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/logs/worker?lines=5")
            data = response.json()
            assert len(data["lines"]) <= 5

    @pytest.mark.asyncio
    async def test_logs_api_returns_200(self):
        """Positive: API logs returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/logs/api")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_logs_admin_returns_200(self):
        """Positive: Admin logs returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/logs/admin")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_logs_invalid_service(self):
        """Negative: Invalid service returns error."""
        async with TestConfig.get_client() as client:
            response = await client.get("/api/logs/invalid_service_xyz")
            assert response.status_code in [400, 404, 500]


# ============================================================================
# UI STATIC TESTS
# ============================================================================

class TestStaticEndpoints:
    """Test static file serving."""

    @pytest.mark.asyncio
    async def test_index_returns_200(self):
        """Positive: Index page returns 200 OK."""
        async with TestConfig.get_client() as client:
            response = await client.get("/")
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_index_is_html(self):
        """Positive: Index page is HTML."""
        async with TestConfig.get_client() as client:
            response = await client.get("/")
            assert "text/html" in response.headers.get("content-type", "")

    @pytest.mark.asyncio
    async def test_index_has_alpine(self):
        """Positive: Index page includes Alpine.js."""
        async with TestConfig.get_client() as client:
            response = await client.get("/")
            assert "alpinejs" in response.text.lower()

    @pytest.mark.asyncio
    async def test_index_has_tailwind(self):
        """Positive: Index page includes Tailwind CSS."""
        async with TestConfig.get_client() as client:
            response = await client.get("/")
            assert "tailwind" in response.text.lower()


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

class TestIntegration:
    """Integration tests combining multiple endpoints."""

    @pytest.mark.asyncio
    async def test_dashboard_stats_match_jobs(self):
        """Integration: Dashboard total matches jobs count."""
        async with TestConfig.get_client() as client:
            dashboard = await client.get("/api/dashboard")
            jobs = await client.get("/api/jobs?limit=1")

            dash_data = dashboard.json()
            jobs_data = jobs.json()

            assert dash_data["stats"]["total_jobs"] == jobs_data["total"]

    @pytest.mark.asyncio
    async def test_parser_stats_match_dashboard(self):
        """Integration: Parser stats match dashboard."""
        async with TestConfig.get_client() as client:
            parser = await client.get("/api/parser/stats")
            dashboard = await client.get("/api/dashboard")

            parser_data = parser.json()
            dash_data = dashboard.json()

            assert parser_data["total_jobs"] == dash_data["stats"]["total_jobs"]

    @pytest.mark.asyncio
    async def test_analytics_match_dashboard(self):
        """Integration: Analytics match dashboard."""
        async with TestConfig.get_client() as client:
            analytics = await client.get("/api/analytics/overview")
            dashboard = await client.get("/api/dashboard")

            analytics_data = analytics.json()
            dash_data = dashboard.json()

            assert analytics_data["total_jobs"] == dash_data["stats"]["total_jobs"]

    @pytest.mark.asyncio
    async def test_database_jobs_count_matches(self):
        """Integration: Database jobs count matches API."""
        async with TestConfig.get_client() as client:
            tables = await client.get("/api/database/tables")
            jobs = await client.get("/api/jobs?limit=1")

            tables_data = tables.json()
            jobs_data = jobs.json()

            jobs_table = next(
                (t for t in tables_data["tables"] if t["name"] == "jobs"),
                None
            )
            if jobs_table:
                assert jobs_table["row_count"] == jobs_data["total"]


# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

class TestPerformance:
    """Basic performance tests."""

    @pytest.mark.asyncio
    async def test_health_response_time(self):
        """Performance: Health check responds quickly."""
        async with TestConfig.get_client() as client:
            start = datetime.now()
            await client.get("/api/health")
            elapsed = (datetime.now() - start).total_seconds()
            assert elapsed < 2.0, f"Health check took {elapsed}s"

    @pytest.mark.asyncio
    async def test_dashboard_response_time(self):
        """Performance: Dashboard responds in reasonable time."""
        async with TestConfig.get_client() as client:
            start = datetime.now()
            await client.get("/api/dashboard")
            elapsed = (datetime.now() - start).total_seconds()
            assert elapsed < 5.0, f"Dashboard took {elapsed}s"

    @pytest.mark.asyncio
    async def test_jobs_list_response_time(self):
        """Performance: Jobs list responds in reasonable time."""
        async with TestConfig.get_client() as client:
            start = datetime.now()
            await client.get("/api/jobs?limit=50")
            elapsed = (datetime.now() - start).total_seconds()
            assert elapsed < 5.0, f"Jobs list took {elapsed}s"


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short", "-x"])
