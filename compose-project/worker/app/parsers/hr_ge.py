"""HR.ge parser adapter."""
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


class HrGeAdapter(BaseAdapter):
    """Parser adapter for hr.ge website.

    HR.ge is one of the largest job boards in Georgia, featuring
    jobs from various sectors across the country.
    """

    source_name = "hr.ge"
    source_domain = "hr.ge"
    base_url = "https://www.hr.ge"
    rate_limit_delay = 1.5  # Be respectful to the server

    # Region mappings for URL filtering
    REGION_MAPPING = {
        "batumi": "ბათუმი",
        "tbilisi": "თბილისი",
        "kutaisi": "ქუთაისი",
        "adjara": "აჭარა",
        "rustavi": "რუსთავი",
    }

    # Category mappings from hr.ge to internal slugs
    CATEGORY_MAPPING = {
        "IT": "it-programming",
        "ინფორმაციული ტექნოლოგიები": "it-programming",
        "პროგრამირება": "it-programming",
        "გაყიდვები": "sales-marketing",
        "მარკეტინგი": "sales-marketing",
        "ფინანსები": "finance-accounting",
        "ბუღალტერია": "finance-accounting",
        "ტურიზმი": "tourism-hospitality",
        "სტუმართმოყვარეობა": "tourism-hospitality",
        "ადმინისტრაცია": "administration",
        "განათლება": "education-training",
        "ჯანდაცვა": "healthcare-medical",
        "მშენებლობა": "construction-engineering",
        "ლოჯისტიკა": "logistics-transport",
        "ტრანსპორტი": "logistics-transport",
        "უსაფრთხოება": "security-services",
        "იურიდიული": "legal",
        "მედია": "media-creative",
        "დიზაინი": "media-creative",
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
        """Parse a job list page from hr.ge."""
        async with HTTPClient(rate_limit_delay=self.rate_limit_delay) as client:
            try:
                # HR.ge uses query parameters for filtering
                url = f"{self.base_url}/vacancies"
                params = {"page": page}

                # Add region filter if specified
                if region and region in self.REGION_MAPPING:
                    params["location"] = self.REGION_MAPPING[region]

                html = await client.get_text(url, params=params)
                return self._extract_jobs_from_list(html)

            except Exception:
                return []

    def _extract_jobs_from_list(self, html: str) -> List[dict]:
        """Extract job entries from list page HTML."""
        soup = BeautifulSoup(html, "lxml")
        jobs = []

        # HR.ge specific selectors - try multiple patterns
        job_items = soup.select(
            ".vacancy-item, .job-item, .vacancy-card, "
            "[data-vacancy], .list-item, .vacancy"
        )

        for item in job_items:
            try:
                # Find link to job detail
                link = item.select_one("a[href*='vacanc'], a[href*='/job/'], a[href]")
                if not link:
                    continue

                href = link.get("href", "")
                if not href or "#" == href:
                    continue

                # Extract external ID from URL
                external_id = self.extract_external_id(href)
                if not external_id:
                    continue

                # Build full URL
                if href.startswith("/"):
                    href = self.base_url + href
                elif not href.startswith("http"):
                    href = self.base_url + "/" + href

                # Extract basic info
                title_elem = item.select_one("h2, h3, .title, .vacancy-title, a")
                title = title_elem.get_text(strip=True) if title_elem else ""

                company_elem = item.select_one(".company, .employer, .company-name")
                company_name = company_elem.get_text(strip=True) if company_elem else None

                # Check for featured/VIP
                is_vip = bool(
                    "vip" in item.get("class", []) or
                    "featured" in item.get("class", []) or
                    item.select_one(".vip, .featured, .premium")
                )

                # Extract category if available
                category_elem = item.select_one(".category, .sector, .industry")
                category = category_elem.get_text(strip=True) if category_elem else None

                jobs.append({
                    "external_id": external_id,
                    "url": href,
                    "title": title,
                    "company_name": company_name,
                    "is_vip": is_vip,
                    "category": category,
                })

            except Exception:
                continue

        return jobs

    async def parse_job(self, url: str) -> Optional[JobData]:
        """Parse a single job detail page from hr.ge."""
        async with HTTPClient(rate_limit_delay=self.rate_limit_delay) as client:
            try:
                html = await client.get_text(url)
                job_data = self._parse_detail_page(html, url)
                return job_data

            except Exception:
                return None

    def _parse_detail_page(self, html: str, url: str) -> Optional[JobData]:
        """Parse job details from a detail page."""
        soup = BeautifulSoup(html, "lxml")

        try:
            # Extract title - try multiple selectors
            title_elem = soup.select_one(
                "h1, .vacancy-title, .job-title, "
                ".page-title, [data-title]"
            )
            if not title_elem:
                return None
            title = title_elem.get_text(strip=True)
            if not title:
                return None

            # Extract body/description
            body_elem = soup.select_one(
                ".vacancy-description, .job-description, "
                ".description, .content, article, "
                ".vacancy-content, .job-content, .details"
            )
            body = clean_html(str(body_elem)) if body_elem else ""
            if not body:
                # Try to get text from any large text block
                text_blocks = soup.select("p, .text, .info")
                body = " ".join(t.get_text(strip=True) for t in text_blocks[:10])

            if not body or len(body) < 50:
                return None

            # Extract company name
            company_elem = soup.select_one(
                ".company-name, .employer, .company, "
                "[data-company], .organization"
            )
            company_name = company_elem.get_text(strip=True) if company_elem else None

            # Extract location
            location_elem = soup.select_one(
                ".location, .city, .address, "
                "[data-location], .region"
            )
            location = location_elem.get_text(strip=True) if location_elem else None

            # Map region from location
            region_slug = None
            if location:
                region_slug = self.map_region(location)

            # Extract dates
            published_at = None
            published_elem = soup.select_one(
                ".date, .published, .post-date, "
                "[data-date], .created"
            )
            if published_elem:
                published_at = extract_date(published_elem.get_text(), "ge")

            deadline_at = None
            deadline_elem = soup.select_one(
                ".deadline, .expires, .valid-until, "
                ".end-date, [data-deadline]"
            )
            if deadline_elem:
                deadline_at = extract_date(deadline_elem.get_text(), "ge")

            # Extract salary
            has_salary = False
            salary_min = salary_max = None
            salary_currency = "GEL"

            salary_elem = soup.select_one(
                ".salary, .compensation, .wage, "
                "[data-salary], .pay"
            )
            if salary_elem:
                salary_text = salary_elem.get_text()
                salary_min, salary_max, salary_currency = extract_salary(salary_text)
                has_salary = salary_min is not None

            # Check for VIP/featured status
            is_vip = bool(soup.select_one(
                ".vip, .featured, .premium, "
                ".top-vacancy, [data-vip]"
            ))

            # Extract category
            category_elem = soup.select_one(
                ".category, .sector, .industry, "
                "[data-category], .field"
            )
            source_category = category_elem.get_text(strip=True) if category_elem else None
            category_slug = self.map_category(source_category) if source_category else None

            # If no category from page, classify from content
            if not category_slug:
                category_slug = classify_category(title, body)

            # Extract employment type
            employment_type = "full_time"
            emp_elem = soup.select_one(
                ".employment-type, .job-type, [data-employment]"
            )
            if emp_elem:
                emp_text = emp_elem.get_text().lower()
                if "part" in emp_text or "ნახევარ" in emp_text:
                    employment_type = "part_time"
                elif "contract" in emp_text or "კონტრაქტ" in emp_text:
                    employment_type = "contract"
                elif "intern" in emp_text or "სტაჟირება" in emp_text:
                    employment_type = "internship"

            # Extract external ID
            external_id = self.extract_external_id(url)
            if not external_id:
                return None

            # Compute content hash for change detection
            content_hash = compute_content_hash(title, body, company_name)

            return JobData(
                external_id=external_id,
                title_ge=title,
                body_ge=body,
                source_url=url,
                parsed_from=self.source_name,
                company_name=company_name,
                location=location,
                region_slug=region_slug,
                has_salary=has_salary,
                salary_min=salary_min,
                salary_max=salary_max,
                salary_currency=salary_currency,
                published_at=published_at,
                deadline_at=deadline_at,
                is_vip=is_vip,
                category_slug=category_slug,
                employment_type=employment_type,
                content_hash=content_hash,
            )

        except Exception:
            return None

    def extract_external_id(self, url: str) -> Optional[str]:
        """Extract job ID from hr.ge URL.

        HR.ge URLs can be in various formats:
        - /vacancy/12345
        - /job/12345
        - /vacancies/12345-job-title
        """
        # Try numeric ID patterns
        patterns = [
            r"/(?:vacancy|job|vacancies)/(\d+)",
            r"/(\d+)(?:-|/|$|\?)",
            r"id=(\d+)",
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)

        # If no numeric ID, use URL hash as fallback
        url_clean = re.sub(r"[?#].*$", "", url)  # Remove query and fragment
        if url_clean:
            import hashlib
            return hashlib.md5(url_clean.encode()).hexdigest()[:12]

        return None

    def map_category(self, source_category: str) -> Optional[str]:
        """Map hr.ge category to internal category slug."""
        if not source_category:
            return None

        source_lower = source_category.lower().strip()

        # Direct mapping
        for key, value in self.CATEGORY_MAPPING.items():
            if key.lower() in source_lower or source_lower in key.lower():
                return value

        return None

    def map_region(self, source_region: str) -> Optional[str]:
        """Map hr.ge region to internal region slug."""
        if not source_region:
            return None

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
            "Adjara": "adjara",
        }

        # Direct match
        if source_region in region_map:
            return region_map[source_region]

        # Partial match
        source_lower = source_region.lower()
        for key, value in region_map.items():
            if key.lower() in source_lower or source_lower in key.lower():
                return value

        return None
