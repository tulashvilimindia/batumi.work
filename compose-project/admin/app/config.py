"""Admin dashboard configuration."""
import os


class Settings:
    """Application settings."""

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://jobboard:jobboard@db:5432/jobboard"
    )
    BACKUP_DIR: str = os.getenv("BACKUP_DIR", "/backups")
    APP_NAME: str = "Batumi.work Admin"
    VERSION: str = "1.0.0"


settings = Settings()
