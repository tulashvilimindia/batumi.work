"""Configuration for parser worker."""
import os
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ParserConfig:
    """Parser configuration settings."""

    # Database
    database_url: str = field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL",
            "postgresql+asyncpg://postgres:postgres@db:5432/jobboard"
        )
    )

    # API connection
    api_url: str = field(
        default_factory=lambda: os.getenv("API_URL", "http://api:8000")
    )
    api_key: str = field(
        default_factory=lambda: os.getenv("ADMIN_API_KEY", "")
    )

    # Scheduling
    parser_interval_minutes: int = field(
        default_factory=lambda: int(os.getenv("PARSER_INTERVAL_MINUTES", "60"))
    )
    not_seen_days_to_inactive: int = field(
        default_factory=lambda: int(os.getenv("NOT_SEEN_DAYS_TO_INACTIVE", "7"))
    )

    # Rate limiting
    rate_limit_delay: float = field(
        default_factory=lambda: float(os.getenv("RATE_LIMIT_DELAY", "1.0"))
    )
    max_retries: int = field(
        default_factory=lambda: int(os.getenv("MAX_RETRIES", "3"))
    )
    request_timeout: float = field(
        default_factory=lambda: float(os.getenv("REQUEST_TIMEOUT", "30.0"))
    )

    # Parsing limits
    max_pages_per_run: int = field(
        default_factory=lambda: int(os.getenv("MAX_PAGES_PER_RUN", "100"))
    )
    max_jobs_per_run: int = field(
        default_factory=lambda: int(os.getenv("MAX_JOBS_PER_RUN", "500"))
    )

    # Proxy settings
    use_proxy: bool = field(
        default_factory=lambda: os.getenv("USE_PROXY", "false").lower() == "true"
    )
    proxies: List[str] = field(
        default_factory=lambda: [
            p.strip() for p in os.getenv("PROXY_LIST", "").split(",") if p.strip()
        ]
    )

    # Regions to parse
    regions: List[str] = field(
        default_factory=lambda: [
            r.strip() for r in os.getenv("PARSE_REGIONS", "batumi,tbilisi").split(",")
        ]
    )

    # Sources to parse
    enabled_sources: List[str] = field(
        default_factory=lambda: [
            s.strip() for s in os.getenv("ENABLED_SOURCES", "jobs.ge").split(",")
        ]
    )

    # Debug
    debug: bool = field(
        default_factory=lambda: os.getenv("DEBUG", "false").lower() == "true"
    )
    log_level: str = field(
        default_factory=lambda: os.getenv("LOG_LEVEL", "INFO")
    )


def get_config() -> ParserConfig:
    """Get parser configuration from environment."""
    return ParserConfig()
