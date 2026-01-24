"""Tests for the FastAPI endpoints."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module")
def client():
    """Create test client."""
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)


class TestHealthEndpoints:
    """Test health check endpoints."""

    def test_health_check(self, client):
        """Test /health endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_root_endpoint(self, client):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data


class TestJobsEndpoints:
    """Test jobs API endpoints."""

    def test_list_jobs_empty(self, client):
        """Test listing jobs when database is empty."""
        response = client.get("/api/v1/jobs")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "meta" in data
        assert data["meta"]["total"] == 0

    def test_list_jobs_with_pagination(self, client):
        """Test jobs listing with pagination params."""
        response = client.get("/api/v1/jobs?page=1&per_page=10")
        assert response.status_code == 200
        data = response.json()
        assert data["meta"]["page"] == 1
        assert data["meta"]["per_page"] == 10

    def test_get_latest_jobs(self, client):
        """Test getting latest jobs."""
        response = client.get("/api/v1/jobs/latest")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_search_jobs(self, client):
        """Test job search endpoint."""
        response = client.get("/api/v1/jobs/search?q=developer")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data

    def test_get_nonexistent_job(self, client):
        """Test getting a job that doesn't exist."""
        response = client.get("/api/v1/jobs/99999")
        assert response.status_code == 404


class TestCompaniesEndpoints:
    """Test companies API endpoints."""

    def test_list_companies_empty(self, client):
        """Test listing companies when database is empty."""
        response = client.get("/api/v1/companies")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "meta" in data

    def test_get_nonexistent_company(self, client):
        """Test getting a company that doesn't exist."""
        response = client.get("/api/v1/companies/99999")
        assert response.status_code == 404


class TestStatsEndpoints:
    """Test statistics API endpoints."""

    def test_get_stats(self, client):
        """Test getting platform statistics."""
        response = client.get("/api/v1/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_jobs" in data
        assert "total_companies" in data

    def test_get_stats_by_location(self, client):
        """Test getting stats by location."""
        response = client.get("/api/v1/stats/by-location")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_salary_stats(self, client):
        """Test getting salary statistics."""
        response = client.get("/api/v1/stats/salary")
        assert response.status_code == 200
        data = response.json()
        assert "jobs_with_salary" in data


class TestParserEndpoints:
    """Test parser API endpoints."""

    def test_get_parser_status(self, client):
        """Test getting parser status."""
        response = client.get("/api/v1/parser/status")
        assert response.status_code == 200
        data = response.json()
        assert "scheduler_running" in data

    def test_get_parser_history(self, client):
        """Test getting parser history."""
        response = client.get("/api/v1/parser/history")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
