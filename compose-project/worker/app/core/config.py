"""Configuration for parser worker."""
import os
from dataclasses import dataclass, field
from typing import List, Optional


def _parse_regions(value: str) -> List[str]:
    """Parse PARSE_REGIONS env var.

    - Empty string or "all" returns empty list (no filter = all jobs)
    - "adjara" or "batumi" uses lid=14 on jobs.ge (Adjara AR)
    - Otherwise returns list of region names
    """
    value = value.strip().lower()
    if not value or value == "all":
        return []
    return [r.strip() for r in value.split(",") if r.strip()]


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

    # API connection - HTTP is intentional for internal Docker network (no TLS needed)
    api_url: str = field(
        default_factory=lambda: os.getenv("API_URL", "http://api:8000")  # NOSONAR
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

    # Regions to parse (empty or "all" means no filter - get all jobs)
    regions: List[str] = field(
        default_factory=lambda: _parse_regions(os.getenv("PARSE_REGIONS", "all"))
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
