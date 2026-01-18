"""Jobs.ge parser adapter."""
import re
from datetime import datetime
from typing import AsyncIterator, List, Optional
from bs4 import BeautifulSoup

from app.core.base_adapter import BaseAdapter, JobData
from app.core.http_client import HTTPClient
from app.core.utils import (
    clean_html,
    compute_content_hash,
    extract_date,
    extract_salary,
    classify_category,
)


class JobsGeAdapter(BaseAdapter):
    """Parser adapter for jobs.ge website."""

    source_name = "jobs.ge"
    source_domain = "jobs.ge"
    base_url = "https://jobs.ge"
    rate_limit_delay = 1.5  # Be respectful to the server

    # Region mappings for URL filtering
    REGION_MAPPING = {
        "batumi": "ბათუმი",
        "tbilisi": "თბილისი",
        "kutaisi": "ქუთაისი",
        "adjara": "აჭარა",
    }

    async def discover_job_urls(self, region: Optional[str] = None) -> AsyncIterator[str]:
        """Discover job URLs from list pages."""
        async with HTTPClient(rate_limit_delay=self.rate_limit_delay) as client:
            page = 1
            while page <= self.max_pages:
                jobs = await self.parse_list_page(page, region)
                if not jobs:
                    break

                for job in jobs:
                    if "url" in job:
                        yield job["url"]

                page += 1

    async def parse_list_page(self, page: int, region: Optional[str] = None) -> List[dict]:
        """Parse a job list page."""
        params = {"page": page}

        # Add region filter if specified
        if region and region in self.REGION_MAPPING:
            params["q"] = self.REGION_MAPPING[region]

        async with HTTPClient(rate_limit_delay=self.rate_limit_delay) as client:
            try:
                # Try Georgian language first
                url = f"{self.base_url}/ge"
                html = await client.get_text(url, params=params)
                return self._extract_jobs_from_list(html, "ge")
            except Exception:
                return []

    def _extract_jobs_from_list(self, html: str, lang: str) -> List[dict]:
        """Extract job entries from list page HTML."""
        soup = BeautifulSoup(html, "lxml")
        jobs = []

        # Find job listing containers (jobs.ge specific selectors)
        job_items = soup.select(".job-listing, .vacancy-item, [data-job-id]")

        for item in job_items:
            try:
                # Extract job ID from link or data attribute
                link = item.select_one("a[href*='/']")
                if not link:
                    continue

                href = link.get("href", "")
                external_id = self.extract_external_id(href)
                if not external_id:
                    continue

                # Build full URL
                if href.startswith("/"):
                    href = self.base_url + href
                elif not href.startswith("http"):
                    href = self.base_url + "/" + href

                # Extract basic info if available
                title = link.get_text(strip=True)
                company = item.select_one(".company-name, .employer")
                company_name = company.get_text(strip=True) if company else None

                # Check for VIP/featured
                is_vip = "vip" in item.get("class", []) or item.select_one(".vip, .featured")

                jobs.append({
                    "external_id": external_id,
                    "url": href,
                    "title": title,
                    "company_name": company_name,
                    "is_vip": bool(is_vip),
                })

            except Exception:
                continue

        return jobs

    async def parse_job(self, url: str) -> Optional[JobData]:
        """Parse a single job detail page."""
        async with HTTPClient(rate_limit_delay=self.rate_limit_delay) as client:
            try:
                # Fetch both language versions
                url_ge = self._make_lang_url(url, "ge")
                url_en = self._make_lang_url(url, "en")

                html_ge = await client.get_text(url_ge)
                job_data = self._parse_detail_page(html_ge, "ge", url_ge)

                if not job_data:
                    return None

                # Try to get English version
                try:
                    html_en = await client.get_text(url_en)
                    en_data = self._parse_detail_page(html_en, "en", url_en)
                    if en_data:
                        job_data.title_en = en_data.title_ge  # title_ge holds the title for that page
                        job_data.body_en = en_data.body_ge
                except Exception:
                    pass

                return job_data

            except Exception:
                return None

    def _make_lang_url(self, url: str, lang: str) -> str:
        """Ensure URL has correct language prefix."""
        # Replace /ge/ or /en/ with desired language
        url = re.sub(r"/(ge|en)/", f"/{lang}/", url)
        if f"/{lang}/" not in url:
            # Add language prefix after domain
            url = re.sub(r"(https?://[^/]+)/", rf"\1/{lang}/", url)
        return url

    def _parse_detail_page(self, html: str, lang: str, url: str) -> Optional[JobData]:
        """Parse job details from a detail page."""
        soup = BeautifulSoup(html, "lxml")

        try:
            # Extract title
            title_elem = soup.select_one("h1, .job-title, .vacancy-title")
            if not title_elem:
                return None
            title = title_elem.get_text(strip=True)

            # Extract body/description
            body_elem = soup.select_one(
                ".job-description, .vacancy-description, "
                ".job-content, article, .description"
            )
            body = clean_html(str(body_elem)) if body_elem else ""
            if not body:
                return None

            # Extract company
            company_elem = soup.select_one(
                ".company-name, .employer-name, "
                "[data-company], .company"
            )
            company_name = company_elem.get_text(strip=True) if company_elem else None

            # Extract location
            location_elem = soup.select_one(
                ".location, .city, [data-location]"
            )
            location = location_elem.get_text(strip=True) if location_elem else None

            # Extract dates
            published_elem = soup.select_one(
                ".published-date, .post-date, .date"
            )
            published_at = None
            if published_elem:
                published_at = extract_date(published_elem.get_text(), lang)

            deadline_elem = soup.select_one(
                ".deadline, .expires, .end-date"
            )
            deadline_at = None
            if deadline_elem:
                deadline_at = extract_date(deadline_elem.get_text(), lang)

            # Extract salary
            salary_elem = soup.select_one(
                ".salary, .compensation, [data-salary]"
            )
            has_salary = False
            salary_min = salary_max = None
            salary_currency = "GEL"
            if salary_elem:
                salary_text = salary_elem.get_text()
                salary_min, salary_max, salary_currency = extract_salary(salary_text)
                has_salary = salary_min is not None

            # Check VIP/featured
            is_vip = bool(soup.select_one(".vip, .featured, .premium"))

            # Get external ID from URL
            external_id = self.extract_external_id(url)
            if not external_id:
                return None

            # Classify category
            category_slug = classify_category(title, body)

            # Compute content hash
            content_hash = compute_content_hash(title, body, company_name)

            return JobData(
                external_id=external_id,
                title_ge=title,
                body_ge=body,
                source_url=url,
                parsed_from=self.source_name,
                company_name=company_name,
                location=location,
                has_salary=has_salary,
                salary_min=salary_min,
                salary_max=salary_max,
                salary_currency=salary_currency,
                published_at=published_at,
                deadline_at=deadline_at,
                is_vip=is_vip,
                category_slug=category_slug,
                content_hash=content_hash,
            )

        except Exception:
            return None

    def extract_external_id(self, url: str) -> Optional[str]:
        """Extract job ID from jobs.ge URL."""
        # jobs.ge URLs are typically like: /ge/12345 or /en/12345
        match = re.search(r"/(?:ge|en)/(\d+)", url)
        return match.group(1) if match else None

    def map_region(self, source_region: str) -> Optional[str]:
        """Map jobs.ge region to internal slug."""
        region_map = {
            "თბილისი": "tbilisi",
            "ბათუმი": "batumi",
            "ქუთაისი": "kutaisi",
            "რუსთავი": "rustavi",
            "აჭარა": "adjara",
            "Tbilisi": "tbilisi",
            "Batumi": "batumi",
            "Kutaisi": "kutaisi",
        }
        return region_map.get(source_region)
