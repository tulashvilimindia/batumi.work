from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    postgres_host: str = "db"
    postgres_port: int = 5432
    postgres_user: str = "hrparser"
    postgres_password: str = "hrparser_secure_2024"
    postgres_db: str = "hr_ge_jobs"
    database_url: str = "postgresql://hrparser:hrparser_secure_2024@db:5432/hr_ge_jobs"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8089

    # Parser
    hr_ge_api_base: str = "https://api.p.hr.ge/public-portal/tenant/1/api/v3"
    hr_ge_sitemap_url: str = "https://api.p.hr.ge/public-portal/tenant/1/api/v3/seo/sitemap"
    parser_rate_limit: float = 1.0
    parser_concurrent_requests: int = 3
    parser_schedule_hours: int = 6

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
