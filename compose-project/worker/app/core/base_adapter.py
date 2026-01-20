"""Base adapter interface for job parsers."""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, AsyncIterator
from uuid import UUID


@dataclass
class JobData:
    """Standardized job data structure returned by adapters."""

    # Required fields
    external_id: str
    title_ge: str
    body_ge: str
    source_url: str
    parsed_from: str

    # Optional bilingual content
    title_en: Optional[str] = None
    body_en: Optional[str] = None

    # Company info
    company_name: Optional[str] = None
    company_id: Optional[UUID] = None

    # Location
    location: Optional[str] = None
    region_slug: Optional[str] = None
    remote_type: str = "onsite"  # onsite, remote, hybrid

    # Category
    category_slug: Optional[str] = None

    # Employment details
    employment_type: str = "full_time"  # full_time, part_time, contract, internship, freelance
    experience_level: Optional[str] = None  # entry, mid, senior, executive, any

    # Salary info
    has_salary: bool = False
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "GEL"
    salary_period: str = "monthly"  # hourly, daily, monthly, yearly

    # Dates
    published_at: Optional[datetime] = None
    deadline_at: Optional[datetime] = None

    # Status flags
    is_vip: bool = False
    is_featured: bool = False

    # Content hash for change detection
    content_hash: Optional[str] = None

    # jobs.ge original filter values
    jobsge_cid: Optional[int] = None  # Original jobs.ge category ID
    jobsge_lid: Optional[int] = None  # Original jobs.ge location ID

    # Raw data for debugging
    raw_data: dict = field(default_factory=dict)


@dataclass
class ParseResult:
    """Result of a parsing operation."""

    jobs: List[JobData] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    total_found: int = 0
    pages_parsed: int = 0

    @property
    def success_rate(self) -> float:
        """Calculate success rate."""
        if self.total_found == 0:
            return 0.0
        return len(self.jobs) / self.total_found


class BaseAdapter(ABC):
    """Base adapter interface for job source parsers.

    All parser adapters must implement this interface to ensure
    consistent behavior across different job sources.
    """

    # Adapter identification
    source_name: str  # e.g., "jobs.ge", "hr.ge"
    source_domain: str  # e.g., "jobs.ge"

    # Configuration
    base_url: str
    rate_limit_delay: float = 1.0  # Seconds between requests
    max_pages: int = 100  # Maximum pages to parse per run

    @abstractmethod
    async def discover_job_urls(self, region: Optional[str] = None) -> AsyncIterator[str]:
        """Discover job listing URLs to parse.

        This method should yield URLs of individual job listings.
        Implement pagination logic here.

        Args:
            region: Optional region filter (e.g., "batumi", "tbilisi")

        Yields:
            Job listing URLs
        """
        pass

    @abstractmethod
    async def parse_job(self, url: str) -> Optional[JobData]:
        """Parse a single job listing page.

        Args:
            url: URL of the job listing

        Returns:
            JobData if successful, None if parsing failed
        """
        pass

    @abstractmethod
    async def parse_list_page(self, page: int, region: Optional[str] = None) -> List[dict]:
        """Parse a job list page and extract basic job info.

        This method parses a list page and extracts enough information
        to identify jobs (external_id, url) and optionally basic fields.

        Args:
            page: Page number (1-indexed)
            region: Optional region filter

        Returns:
            List of dicts with at least 'external_id' and 'url' keys
        """
        pass

    async def run(self, region: Optional[str] = None) -> ParseResult:
        """Execute a full parsing run.

        This is the main entry point for running the parser.
        Default implementation iterates through discover_job_urls
        and parses each job.

        Args:
            region: Optional region filter

        Returns:
            ParseResult with all parsed jobs and statistics
        """
        result = ParseResult()

        async for url in self.discover_job_urls(region):
            result.total_found += 1
            try:
                job = await self.parse_job(url)
                if job:
                    result.jobs.append(job)
            except Exception as e:
                result.errors.append(f"Error parsing {url}: {str(e)}")

        return result

    def extract_external_id(self, url: str) -> Optional[str]:
        """Extract external ID from URL.

        Override this method if the source uses non-standard URL patterns.
        Default implementation tries to extract numeric ID from URL.

        Args:
            url: Job listing URL

        Returns:
            External ID string or None
        """
        import re
        match = re.search(r'/(\d+)(?:/|$|\?)', url)
        return match.group(1) if match else None

    def map_category(self, source_category: str) -> Optional[str]:
        """Map source category to internal category slug.

        Override this method to implement category mapping for the source.

        Args:
            source_category: Category name/code from source

        Returns:
            Internal category slug or None
        """
        return None

    def map_region(self, source_region: str) -> Optional[str]:
        """Map source region to internal region slug.

        Override this method to implement region mapping for the source.

        Args:
            source_region: Region name from source

        Returns:
            Internal region slug or None
        """
        return None
