"""Application configuration using Pydantic settings."""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "Georgia JobBoard API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/jobboard"
    DATABASE_SYNC_URL: str = "postgresql://postgres:postgres@db:5432/jobboard"

    # Security
    ADMIN_API_KEY: str = "change-me-in-production"
    SECRET_KEY: str = "change-me-in-production-secret-key"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Parser settings (Phase 2)
    PARSER_INTERVAL_MINUTES: int = 60
    NOT_SEEN_DAYS_TO_INACTIVE: int = 7
    AUTO_APPROVE_PARSED_JOBS: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
