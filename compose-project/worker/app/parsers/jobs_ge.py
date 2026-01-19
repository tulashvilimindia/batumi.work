"""Jobs.ge parser adapter - Updated for actual jobs.ge HTML structure."""
import re
from datetime import datetime
from typing import AsyncIterator, List, Optional
from urllib.parse import urljoin, urlparse, parse_qs
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
    """Parser adapter for jobs.ge website.

    jobs.ge uses a table-based layout with URLs like:
    - List: https://jobs.ge/ge/?view=jobs&page=1
    - Detail: https://jobs.ge/ge/?view=jobs&id=12345
    """

    source_name = "jobs.ge"
    source_domain = "jobs.ge"
    base_url = "https://jobs.ge"
    rate_limit_delay = 2.0  # Be respectful to the server

    # Category mappings for jobs.ge
    CATEGORY_MAPPING = {
        "IT": "it-programming",
        "მარკეტინგი": "sales-marketing",
        "გაყიდვები": "sales-marketing",
        "ფინანსები": "finance-accounting",
        "ბუღალტერია": "finance-accounting",
        "ადმინისტრაცია": "administration",
        "განათლება": "education-training",
        "ჯანდაცვა": "healthcare-medical",
        "მშენებლობა": "construction-engineering",
        "ტრანსპორტი": "logistics-transport",
        "ტურიზმი": "tourism-hospitality",
        "სტუმართმოყვარეობა": "tourism-hospitality",
    }

    async def discover_job_urls(self, region: Optional[str] = None) -> AsyncIterator[str]:
        """Discover job URLs from list pages."""
        page = 1
        consecutive_empty = 0

        while page <= self.max_pages and consecutive_empty < 3:
            jobs = await self.parse_list_page(page, region)

            if not jobs:
                consecutive_empty += 1
                page += 1
                continue

            consecutive_empty = 0
            for job in jobs:
                if "url" in job:
                    yield job["url"]

            page += 1

    async def parse_list_page(self, page: int, region: Optional[str] = None) -> List[dict]:
        """Parse a job list page from jobs.ge."""
        # jobs.ge list URL format: /ge/?view=jobs&page=N
        params = {
            "view": "jobs",
            "page": page
        }

        # Add region/search filter if specified
        if region:
            params["q"] = region

        async with HTTPClient(rate_limit_delay=self.rate_limit_delay) as client:
            try:
                url = f"{self.base_url}/ge/"
                html = await client.get_text(url, params=params)
                return self._extract_jobs_from_list(html)
            except Exception as e:
                return []

    def _extract_jobs_from_list(self, html: str) -> List[dict]:
        """Extract job entries from jobs.ge list page HTML."""
        soup = BeautifulSoup(html, "lxml")
        jobs = []

        # jobs.ge uses links with href containing "view=jobs&id="
        job_links = soup.select('a[href*="view=jobs&id="]')

        seen_ids = set()
        for link in job_links:
            try:
                href = link.get("href", "")
                if not href:
                    continue

                # Extract job ID from URL
                external_id = self._extract_id_from_url(href)
                if not external_id or external_id in seen_ids:
                    continue

                seen_ids.add(external_id)

                # Build full URL
                full_url = urljoin(self.base_url, href)

                # Get title from link text
                title = link.get_text(strip=True)
                if not title or len(title) < 3:
                    continue

                # Try to find company name (sibling or parent element)
                company_name = None
                parent = link.find_parent("tr") or link.find_parent("div")
                if parent:
                    company_link = parent.select_one('a[href*="view=client"]')
                    if company_link:
                        company_name = company_link.get_text(strip=True)

                # Check for VIP/featured indicators
                is_vip = False
                if parent:
                    parent_html = str(parent).lower()
                    is_vip = "vip" in parent_html or "premium" in parent_html or "top" in parent_html

                jobs.append({
                    "external_id": external_id,
                    "url": full_url,
                    "title": title,
                    "company_name": company_name,
                    "is_vip": is_vip,
                })

            except Exception:
                continue

        return jobs

    async def parse_job(self, url: str) -> Optional[JobData]:
        """Parse a single job detail page from jobs.ge."""
        async with HTTPClient(rate_limit_delay=self.rate_limit_delay) as client:
            try:
                # Fetch Georgian version
                html_ge = await client.get_text(url)
                job_data = self._parse_detail_page(html_ge, url)

                if not job_data:
                    return None

                # Try to get English version
                try:
                    url_en = url.replace("/ge/", "/en/")
                    html_en = await client.get_text(url_en)
                    en_data = self._parse_detail_page(html_en, url_en)
                    if en_data:
                        job_data.title_en = en_data.title_ge
                        job_data.body_en = en_data.body_ge
                except Exception:
                    pass

                return job_data

            except Exception:
                return None

    def _parse_detail_page(self, html: str, url: str) -> Optional[JobData]:
        """Parse job details from a jobs.ge detail page."""
        soup = BeautifulSoup(html, "lxml")

        try:
            # Extract title - try multiple selectors
            title = None
            for selector in ["h1", "h2", ".title", ".job-title", "td b", "td strong"]:
                elem = soup.select_one(selector)
                if elem:
                    text = elem.get_text(strip=True)
                    if text and len(text) > 5:
                        title = text
                        break

            if not title:
                # Try to find title from page title
                title_tag = soup.find("title")
                if title_tag:
                    title = title_tag.get_text(strip=True).split("|")[0].strip()

            if not title:
                return None

            # Extract body/description - jobs.ge uses tables
            body = ""

            # Try common description containers
            for selector in [".description", ".job-description", ".content", "article",
                           "td[colspan]", ".vacancy-text", "#job-description"]:
                elem = soup.select_one(selector)
                if elem:
                    body = clean_html(str(elem))
                    if len(body) > 100:
                        break

            # Fallback: get all text from main content area
            if not body or len(body) < 100:
                main_content = soup.select_one("main, #content, .main, body")
                if main_content:
                    # Remove scripts and styles
                    for tag in main_content.select("script, style, nav, header, footer"):
                        tag.decompose()
                    body = clean_html(str(main_content))

            if not body or len(body) < 50:
                return None

            # Extract company name
            company_name = None
            company_link = soup.select_one('a[href*="view=client"]')
            if company_link:
                company_name = company_link.get_text(strip=True)

            # Extract location
            location = None
            for selector in [".location", ".city", ".address", 'td:contains("ადგილმდებარეობა")']:
                try:
                    elem = soup.select_one(selector)
                    if elem:
                        location = elem.get_text(strip=True)
                        break
                except:
                    pass

            # Extract dates
            published_at = None
            deadline_at = None

            # Look for date patterns in the page
            date_pattern = r'\d{1,2}[./]\d{1,2}[./]\d{2,4}'
            text = soup.get_text()
            dates = re.findall(date_pattern, text)
            if dates:
                published_at = extract_date(dates[0], "ge")
                if len(dates) > 1:
                    deadline_at = extract_date(dates[-1], "ge")

            # Extract salary
            has_salary = False
            salary_min = salary_max = None
            salary_currency = "GEL"

            salary_patterns = [r'(\d+)\s*[-–]\s*(\d+)\s*(GEL|ლარი|USD|\$|EUR|€)',
                             r'(\d+)\s*(GEL|ლარი|USD|\$|EUR|€)']
            for pattern in salary_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    groups = match.groups()
                    if len(groups) >= 2:
                        salary_min = int(groups[0])
                        if len(groups) >= 3:
                            salary_max = int(groups[1])
                            salary_currency = groups[2]
                        else:
                            salary_currency = groups[1]
                        has_salary = True
                        break

            # Check VIP/featured
            page_html = str(soup).lower()
            is_vip = "vip" in page_html or "premium" in page_html

            # Get external ID from URL
            external_id = self._extract_id_from_url(url)
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

    def _extract_id_from_url(self, url: str) -> Optional[str]:
        """Extract job ID from jobs.ge URL.

        URLs are like: /ge/?view=jobs&id=12345 or https://jobs.ge/ge/?view=jobs&id=12345
        """
        # Try to parse as URL with query string
        try:
            parsed = urlparse(url)
            params = parse_qs(parsed.query)
            if "id" in params:
                return params["id"][0]
        except:
            pass

        # Fallback: regex extraction
        match = re.search(r'[?&]id=(\d+)', url)
        if match:
            return match.group(1)

        # Legacy format: /ge/12345
        match = re.search(r'/(?:ge|en)/(\d+)(?:\?|$|/)', url)
        if match:
            return match.group(1)

        return None

    def extract_external_id(self, url: str) -> Optional[str]:
        """Alias for _extract_id_from_url for interface compatibility."""
        return self._extract_id_from_url(url)

    def map_region(self, source_region: str) -> Optional[str]:
        """Map jobs.ge region to internal slug."""
        region_map = {
            "თბილისი": "tbilisi",
            "ბათუმი": "batumi",
            "ქუთაისი": "kutaisi",
            "რუსთავი": "rustavi",
            "აჭარა": "adjara",
            "იმერეთი": "imereti",
            "კახეთი": "kakheti",
            "Tbilisi": "tbilisi",
            "Batumi": "batumi",
            "Kutaisi": "kutaisi",
            "Rustavi": "rustavi",
        }

        if source_region in region_map:
            return region_map[source_region]

        # Partial match
        source_lower = source_region.lower()
        for key, value in region_map.items():
            if key.lower() in source_lower:
                return value

        return None
