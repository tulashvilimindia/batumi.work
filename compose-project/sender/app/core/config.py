"""Application configuration using Pydantic settings."""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "Channel Sender Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    LOG_LEVEL: str = "INFO"
    LOG_JSON: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/jobboard"

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHANNEL_ID: str = "@batumiworkofficial"

    # Web URL for job links
    WEB_URL: str = "https://batumi.work"

    # SMTP for reports
    SMTP_HOST: str = "mailpit"
    SMTP_PORT: int = 1025
    SMTP_FROM: str = "sender@batumi.work"
    REPORT_EMAIL_TO: str = "admin@batumi.work"

    # Business hours (Georgian time UTC+4)
    BUSINESS_HOURS_START: int = 9  # 9 AM
    BUSINESS_HOURS_END: int = 21   # 9 PM

    # Rate limiting
    MAX_MESSAGES_PER_MINUTE: int = 20
    MAX_MESSAGES_PER_HOUR: int = 60
    MESSAGE_DELAY_SECONDS: float = 3.0

    # Retry settings
    MAX_RETRIES: int = 3
    RETRY_DELAY_SECONDS: int = 60

    # Admin API
    API_PORT: int = 8001

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
