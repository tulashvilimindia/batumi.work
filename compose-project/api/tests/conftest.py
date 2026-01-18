"""Pytest configuration and fixtures."""
import asyncio
import os
from typing import AsyncGenerator, Generator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker

# Set test environment
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "postgresql+asyncpg://postgres:postgres@localhost:5432/jobboard_test"
os.environ["DATABASE_SYNC_URL"] = "postgresql://postgres:postgres@localhost:5432/jobboard_test"
os.environ["ADMIN_API_KEY"] = "test-api-key"

from app.main import app
from app.core.database import Base, get_db
from app.models import Category, Region, Job


# Test database URL
TEST_DATABASE_URL = os.environ["DATABASE_URL"]
TEST_SYNC_DATABASE_URL = os.environ["DATABASE_SYNC_URL"]


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    """Create async database engine for tests."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Drop tables after tests
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create database session for tests."""
    async_session = async_sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create async HTTP client for API tests."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def sample_category(db_session: AsyncSession) -> Category:
    """Create a sample category for tests."""
    category = Category(
        id=uuid4(),
        name_ge="IT და პროგრამირება",
        name_en="IT & Programming",
        slug="it-programming",
        code="IT",
        is_active=True,
        sort_order=1,
    )
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category


@pytest_asyncio.fixture
async def sample_region(db_session: AsyncSession) -> Region:
    """Create a sample region for tests."""
    region = Region(
        id=uuid4(),
        name_ge="თბილისი",
        name_en="Tbilisi",
        slug="tbilisi",
        level=2,
        is_active=True,
    )
    db_session.add(region)
    await db_session.commit()
    await db_session.refresh(region)
    return region


@pytest_asyncio.fixture
async def sample_job(db_session: AsyncSession, sample_category: Category, sample_region: Region) -> Job:
    """Create a sample job for tests."""
    job = Job(
        id=uuid4(),
        title_ge="Python დეველოპერი",
        title_en="Python Developer",
        body_ge="ვეძებთ გამოცდილ Python დეველოპერს.",
        body_en="We are looking for an experienced Python developer.",
        company_name="Test Company",
        category_id=sample_category.id,
        region_id=sample_region.id,
        status="active",
        parsed_from="manual",
        external_id="test-123",
        content_hash="abc123",
        has_salary=True,
        salary_min=3000,
        salary_max=5000,
        salary_currency="GEL",
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)
    return job


# API key header for admin endpoints
@pytest.fixture
def admin_headers() -> dict:
    """Return headers with admin API key."""
    return {"X-API-Key": "test-api-key"}
