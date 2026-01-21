"""jobs.ge parser - Filter-based approach.

This parser iterates through region/category combinations using jobs.ge's native
filter parameters (cid for category, lid for location/region).

Key features:
- Category is KNOWN from URL parameter (cid), not guessed by keywords
- Region is KNOWN from URL parameter (lid)
- Iterates: Region → Category → Jobs (with pagination)
- Deduplicates by source_url

URL format: https://jobs.ge/ge/?cid={category_id}&lid={region_id}&page={page}
"""
import re
import structlog
from datetime import datetime
from typing import Awaitable, Callable, List, Optional, Set
from urllib.parse import urljoin
from bs4 import BeautifulSoup

from app.core.base_adapter import BaseAdapter, JobData, ParseResult
from app.core.http_client import HTTPClient
from app.core.utils import clean_html, compute_content_hash, extract_date, extract_salary, classify_category
from app.parsers.jobsge_config import (
    JOBSGE_CATEGORIES,
    CategoryConfig,
    RegionConfig,
    get_enabled_regions,
    get_regions_by_slugs,
    get_all_categories,
)


logger = structlog.get_logger()


class JobsGeAdapter(BaseAdapter):
    """Parser adapter for jobs.ge using native filter parameters.

    Strategy:
    1. Iterate through each enabled region (starting with Adjara - lid=14)
    2. For each region, iterate through all categories (cid=1 to cid=18)
    3. Fetch jobs using filter URL: https://jobs.ge/ge/?cid={cid}&lid={lid}
    4. Category and region are KNOWN from URL parameters
    5. Handle pagination if multiple pages exist
    6. Deduplicate by source_url (original job URL)

    Example URLs:
    - IT jobs in Adjara: https://jobs.ge/ge/?cid=6&lid=14
    - Sales in Tbilisi: https://jobs.ge/ge/?cid=2&lid=1
    """

    source_name = "jobs.ge"
    source_domain = "jobs.ge"
    base_url = "https://jobs.ge"
    rate_limit_delay = 2.0
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

    def __init__(self):
        """Initialize the parser with category and region configs."""
        self.categories = get_all_categories()
        self.regions = get_enabled_regions()
        self._seen_urls: Set[str] = set()  # For deduplication within a run
        self._on_job_parsed: Optional[Callable[[JobData], Awaitable[str]]] = None

    async def run(
        self,
        region: Optional[str] = None,
        on_job_parsed: Optional[Callable[[JobData], Awaitable[str]]] = None
    ) -> ParseResult:
        """Execute full parsing run through region/category combinations.

        Args:
            region: Optional region slug to parse (e.g., "adjara").
                   If None, parses all enabled regions.
                   Can be comma-separated: "adjara,tbilisi"
            on_job_parsed: Optional async callback called for each parsed job.
                          If provided, jobs are NOT collected in result.jobs.
                          Callback receives JobData and should return status string.

        Returns:
            ParseResult with statistics (jobs list empty if callback provided)
        """
        result = ParseResult()
        self._seen_urls.clear()
        self._on_job_parsed = on_job_parsed  # Store for use in _parse_category

        # Determine which regions to parse
        if region:
            # Parse specific region(s)
            region_slugs = [r.strip() for r in region.split(",")]
            regions_to_parse = get_regions_by_slugs(region_slugs)
            if not regions_to_parse:
                # Fallback: try to find by name
                regions_to_parse = [
                    r for r in self.regions
                    if r.our_slug in region_slugs or r.name_en.lower() in [s.lower() for s in region_slugs]
                ]
        else:
            regions_to_parse = self.regions

        if not regions_to_parse:
            logger.warning("no_regions_to_parse", requested=region)
            return result

        logger.info(
            "parser_starting",
            regions=[r.name_en for r in regions_to_parse],
            categories=len(self.categories),
            instant_mode=on_job_parsed is not None,
        )

        async with HTTPClient(
            rate_limit_delay=self.rate_limit_delay,
            headers={"User-Agent": self.user_agent}
        ) as client:
            self.client = client

            for region_config in regions_to_parse:
                try:
                    region_result = await self._parse_region(region_config)
                    if not on_job_parsed:
                        result.jobs.extend(region_result.jobs)
                    result.errors.extend(region_result.errors)
                    result.pages_parsed += region_result.pages_parsed
                except Exception as e:
                    error_msg = f"Error parsing region {region_config.name_en}: {str(e)}"
                    logger.error("region_parse_failed", region=region_config.name_en, error=str(e))
                    result.errors.append(error_msg)

        if not on_job_parsed:
            result.total_found = len(result.jobs)
        logger.info(
            "parser_completed",
            pages_parsed=result.pages_parsed,
            errors=len(result.errors),
        )

        return result

    async def _parse_region(self, region: RegionConfig) -> ParseResult:
        """Parse all categories for a single region.

        Args:
            region: Region configuration

        Returns:
            ParseResult for this region
        """
        result = ParseResult()
        jobs_in_region = 0

        logger.info("parsing_region", region=region.name_en, lid=region.lid)

        for category in self.categories:
            try:
                cat_result = await self._parse_category(region, category)
                if not self._on_job_parsed:
                    result.jobs.extend(cat_result.jobs)
                jobs_in_region += cat_result.total_found
                result.errors.extend(cat_result.errors)
                result.pages_parsed += cat_result.pages_parsed

                if cat_result.total_found > 0:
                    logger.info(
                        "category_completed",
                        region=region.name_en,
                        category=category.name_en,
                        cid=category.cid,
                        jobs_found=cat_result.total_found,
                    )
            except Exception as e:
                error_msg = f"Error parsing {region.name_en}/{category.name_en}: {str(e)}"
                logger.warning("category_parse_failed", region=region.name_en, category=category.name_en, error=str(e))
                result.errors.append(error_msg)

        logger.info(
            "region_completed",
            region=region.name_en,
            lid=region.lid,
            jobs_found=jobs_in_region,
            categories_parsed=len(self.categories),
        )

        return result

    async def _parse_category(
        self,
        region: RegionConfig,
        category: CategoryConfig
    ) -> ParseResult:
        """Parse all jobs for a specific region/category combination.

        Handles pagination automatically by checking for next page links.
        If on_job_parsed callback is set, calls it for each job immediately.

        Args:
            region: Region configuration
            category: Category configuration

        Returns:
            ParseResult for this category
        """
        result = ParseResult()
        page = 1
        max_pages = 50  # Safety limit
        jobs_found = 0

        while page <= max_pages:
            # Build filter URL
            url = self._build_filter_url(region.lid, category.cid, page)

            try:
                html = await self.client.get_text(url)
                result.pages_parsed += 1

                # Extract job URLs from list
                job_urls = self._extract_job_urls(html)

                # If no jobs found on this page, stop pagination
                if not job_urls:
                    break

                # Parse each job
                for job_url in job_urls:
                    # Skip if already seen (within this run)
                    if job_url in self._seen_urls:
                        continue
                    self._seen_urls.add(job_url)

                    try:
                        job = await self._parse_job_detail(job_url, region, category)
                        if job:
                            jobs_found += 1
                            # If callback provided, call it immediately
                            if self._on_job_parsed:
                                await self._on_job_parsed(job)
                            else:
                                result.jobs.append(job)
                    except Exception as e:
                        result.errors.append(f"Error parsing job {job_url}: {str(e)}")

                # Check for next page
                if not self._has_next_page(html, page):
                    break

                page += 1

            except Exception as e:
                result.errors.append(f"Error fetching {url}: {str(e)}")
                break

        result.total_found = jobs_found
        return result

    def _build_filter_url(self, lid: int, cid: int, page: int = 1) -> str:
        """Build jobs.ge filter URL.

        Args:
            lid: Location/region ID
            cid: Category ID
            page: Page number (1-indexed)

        Returns:
            Complete filter URL
        """
        url = f"{self.base_url}/ge/?cid={cid}&lid={lid}"
        if page > 1:
            url += f"&page={page}"
        return url

    def _extract_job_urls(self, html: str) -> List[str]:
        """Extract job detail URLs from list page.

        Args:
            html: HTML content of list page

        Returns:
            List of absolute job URLs (deduplicated)
        """
        soup = BeautifulSoup(html, "lxml")
        urls = []
        seen_ids = set()

        # Find all job links (href contains "id=" and is a job view)
        for link in soup.find_all("a", href=True):
            href = link["href"]

            # Skip non-job links
            if "id=" not in href:
                continue

            # Skip organization links, category links, etc.
            if "org=" in href or "cid=" in href or "lid=" in href:
                continue

            # Extract job ID
            match = re.search(r'[?&]id=(\d+)', href)
            if match:
                job_id = match.group(1)
                if job_id not in seen_ids:
                    seen_ids.add(job_id)
                    # Build canonical URL
                    full_url = f"{self.base_url}/ge/?view=jobs&id={job_id}"
                    urls.append(full_url)

        return urls

    def _has_next_page(self, html: str, current_page: int) -> bool:
        """Check if there's a next page of results.

        Args:
            html: HTML content of current page
            current_page: Current page number

        Returns:
            True if next page exists
        """
        soup = BeautifulSoup(html, "lxml")
        next_page = current_page + 1

        # Look for pagination links
        for link in soup.find_all("a", href=True):
            href = link["href"]
            if f"page={next_page}" in href:
                return True

        return False

    async def _parse_job_detail(
        self,
        url: str,
        region: RegionConfig,
        category: CategoryConfig
    ) -> Optional[JobData]:
        """Parse a single job detail page.

        Args:
            url: Job detail URL (e.g., https://jobs.ge/ge/?view=jobs&id=693885)
            region: Region this job was found in (from filter)
            category: Category this job was found in (from filter)

        Returns:
            JobData or None if parsing failed
        """
        try:
            # Fetch Georgian version
            html_ge = await self.client.get_text(url)
            soup_ge = BeautifulSoup(html_ge, "lxml")

            # Extract title
            title = self._extract_title(soup_ge)
            if not title:
                return None

            # Extract body
            body = self._extract_body(soup_ge)

            # Extract company
            company_name = self._extract_company(soup_ge)

            # Extract dates
            published_at = self._extract_published_date(soup_ge)
            deadline_at = self._extract_deadline_date(soup_ge)

            # Extract salary
            salary_min, salary_max, salary_currency = self._extract_salary_info(soup_ge)

            # Check VIP status
            is_vip = self._check_vip_status(soup_ge)

            # Extract job ID for external_id
            external_id = self._extract_id_from_url(url)

            # Fetch English version
            title_en = None
            body_en = None
            try:
                url_en = url.replace("/ge/", "/en/")
                html_en = await self.client.get_text(url_en)
                soup_en = BeautifulSoup(html_en, "lxml")
                title_en = self._extract_title(soup_en)
                body_en = self._extract_body(soup_en)
            except Exception:
                pass  # English version is optional

            # Compute content hash for change detection
            content_hash = compute_content_hash(title, body, company_name)

            # Determine category: use keyword classification to verify/override filter category
            # This handles cases where jobs appear in wrong category listings
            filter_category_slug = category.our_slug
            classified_category_slug = classify_category(title, body or "")

            # Use classified category if it's confident (not "other") and differs from filter
            # This prevents miscategorization from cross-listed or recommended jobs
            final_category_slug = filter_category_slug
            if classified_category_slug and classified_category_slug != "other":
                if classified_category_slug != filter_category_slug:
                    logger.debug(
                        "category_override",
                        title=title[:50] if title else "",
                        filter_category=filter_category_slug,
                        classified_category=classified_category_slug,
                    )
                    final_category_slug = classified_category_slug

            return JobData(
                # Required fields
                external_id=external_id,
                title_ge=title,
                body_ge=body or "",
                source_url=url,
                parsed_from=self.source_name,

                # Bilingual content
                title_en=title_en,
                body_en=body_en,

                # Company
                company_name=company_name,

                # Location - from filter parameters (known!)
                location=region.name_ge,
                region_slug=region.our_slug,

                # Category - verified/overridden by keyword classification
                category_slug=final_category_slug,

                # jobs.ge original filter values (keep original for reference)
                jobsge_cid=category.cid,
                jobsge_lid=region.lid,

                # Dates
                published_at=published_at,
                deadline_at=deadline_at,

                # Salary
                has_salary=salary_min is not None,
                salary_min=salary_min,
                salary_max=salary_max,
                salary_currency=salary_currency or "GEL",

                # Flags
                is_vip=is_vip,

                # Content hash
                content_hash=content_hash,
            )

        except Exception as e:
            logger.debug("job_parse_failed", url=url, error=str(e))
            return None

    def _extract_title(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract job title from page."""
        # Try common title selectors
        for selector in ["h1", "h2", ".title", ".job-title", "td b", "td strong"]:
            elem = soup.select_one(selector)
            if elem:
                text = elem.get_text(strip=True)
                if text and len(text) > 3:
                    # Skip navigation/breadcrumb text
                    if "ყველა" not in text and "ვაკანსია" not in text.lower()[:15]:
                        return text

        # Fallback: page title
        title_tag = soup.find("title")
        if title_tag:
            text = title_tag.get_text(strip=True)
            # Remove site suffix
            if "|" in text:
                return text.split("|")[0].strip()
            if "-" in text:
                return text.split("-")[0].strip()
            return text

        return None

    def _extract_body(self, soup: BeautifulSoup) -> str:
        """Extract job description from page."""
        # Try common description containers
        for selector in [".description", ".job-description", ".content",
                        "article", "td[colspan]", ".vacancy-text", "#job-description"]:
            elem = soup.select_one(selector)
            if elem:
                body = clean_html(str(elem))
                if len(body) > 50:
                    return body

        # Fallback: try to get main content area
        main = soup.select_one("main, #content, .main")
        if main:
            # Remove navigation elements
            for tag in main.select("script, style, nav, header, footer, .menu"):
                tag.decompose()
            body = clean_html(str(main))
            if len(body) > 50:
                return body

        return ""

    def _extract_company(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract company name from page."""
        # Look for company-specific elements
        for selector in [".company-name", ".employer", ".org-name"]:
            elem = soup.select_one(selector)
            if elem:
                text = elem.get_text(strip=True)
                if text and len(text) > 1:
                    return text

        # Look for organization links (jobs.ge uses view=client&client= pattern)
        for link in soup.find_all("a", href=True):
            href = link["href"]
            # Check for jobs.ge client links or org links
            if "view=client&client=" in href or "org=" in href:
                text = link.get_text(strip=True)
                # Skip generic link text
                if text and "ყველა" not in text and "ორგანიზაცია" not in text and "განცხადება" not in text:
                    if len(text) > 1 and len(text) < 200:
                        return text

        # Fallback: extract from page title (format: "ჯობს.გე - JobTitle - CompanyName")
        title_tag = soup.find("title")
        if title_tag:
            title_text = title_tag.get_text(strip=True)
            # Pattern: "ჯობს.გე - JobTitle - CompanyName" or "Jobs.GE - JobTitle - CompanyName"
            if " - " in title_text:
                parts = title_text.split(" - ")
                if len(parts) >= 3:
                    # Last part is usually the company name
                    company = parts[-1].strip()
                    if company and len(company) > 1 and len(company) < 200:
                        # Skip if it's just the site name
                        if company.lower() not in ["jobs.ge", "ჯობს.გე"]:
                            return company

        return None

    def _extract_published_date(self, soup: BeautifulSoup) -> Optional[datetime]:
        """Extract published date from page."""
        # Look for date patterns in common locations
        page_text = soup.get_text()
        date = extract_date(page_text)
        return date

    def _extract_deadline_date(self, soup: BeautifulSoup) -> Optional[datetime]:
        """Extract deadline date from page."""
        # Look for deadline-specific text
        for pattern in [r'ბოლო.*ვადა', r'deadline', r'დედლაინ']:
            for elem in soup.find_all(string=re.compile(pattern, re.I)):
                parent = elem.parent
                if parent:
                    # Get surrounding text
                    context = parent.get_text() if parent else str(elem)
                    date = extract_date(context)
                    if date:
                        return date
        return None

    def _extract_salary_info(self, soup: BeautifulSoup):
        """Extract salary information from page.

        Returns:
            Tuple of (min_salary, max_salary, currency)
        """
        page_text = soup.get_text()
        return extract_salary(page_text)

    def _check_vip_status(self, soup: BeautifulSoup) -> bool:
        """Check if job is VIP/premium listing."""
        html_lower = str(soup).lower()
        return "vip" in html_lower or "premium" in html_lower or "პრემიუმ" in html_lower

    def _extract_id_from_url(self, url: str) -> Optional[str]:
        """Extract job ID from URL.

        Args:
            url: Job URL (e.g., https://jobs.ge/ge/?view=jobs&id=693885)

        Returns:
            Job ID string (e.g., "693885")
        """
        match = re.search(r'[?&]id=(\d+)', url)
        return match.group(1) if match else None

    # =========================================================================
    # LEGACY INTERFACE METHODS (for compatibility with BaseAdapter)
    # =========================================================================

    async def discover_job_urls(self, region: Optional[str] = None):
        """Legacy interface - not used in new implementation.

        The new implementation uses run() directly which iterates
        through region/category combinations.
        """
        # This method is not used in the new implementation
        # but kept for interface compatibility
        return
        yield  # Make it a generator

    async def parse_job(self, url: str) -> Optional[JobData]:
        """Legacy interface - parse a single job without context.

        Note: This loses the category/region information from filters.
        Use _parse_job_detail() with region/category params instead.
        """
        # Create dummy region/category for legacy calls
        from app.parsers.jobsge_config import get_region_by_lid, get_category_by_cid
        region = get_region_by_lid(14)  # Default to Adjara
        category = get_category_by_cid(9)  # Default to "Other"

        async with HTTPClient(
            rate_limit_delay=self.rate_limit_delay,
            headers={"User-Agent": self.user_agent}
        ) as client:
            self.client = client
            return await self._parse_job_detail(url, region, category)

    async def parse_list_page(self, page: int, region: Optional[str] = None) -> List[dict]:
        """Legacy interface - not used in new implementation."""
        # This method is not used in the new implementation
        return []

    def extract_external_id(self, url: str) -> Optional[str]:
        """Extract external ID from URL (interface method)."""
        return self._extract_id_from_url(url)

    def map_category(self, source_category: str) -> Optional[str]:
        """Map source category to internal slug (not used - category is from URL)."""
        return None

    def map_region(self, source_region: str) -> Optional[str]:
        """Map source region to internal slug (not used - region is from URL)."""
        return None
