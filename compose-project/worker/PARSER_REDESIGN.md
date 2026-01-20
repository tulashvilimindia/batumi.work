# Jobs.ge Parser Redesign - Implementation Plan

**Document Version:** 1.1
**Created:** January 20, 2026
**Status:** ✅ IMPLEMENTED AND DEPLOYED (January 20, 2026)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Problems](#2-current-architecture-problems)
3. [New Architecture Design](#3-new-architecture-design)
4. [jobs.ge Filter System](#4-jobsge-filter-system)
5. [Database Schema Changes](#5-database-schema-changes)
6. [Parser Implementation Details](#6-parser-implementation-details)
7. [Configuration](#7-configuration)
8. [Deduplication Strategy](#8-deduplication-strategy)
9. [Error Handling](#9-error-handling)
10. [Testing Plan](#10-testing-plan)
11. [Migration Plan](#11-migration-plan)
12. [File Changes Summary](#12-file-changes-summary)

---

## 1. Executive Summary

### Goal
Redesign the jobs.ge parser to use jobs.ge's native category and region filters instead of keyword-based classification.

### Key Changes
- **Before:** Fetch all jobs → Classify by keywords → Save
- **After:** Iterate regions → Iterate categories → Fetch filtered jobs → Save with known category

### Benefits
1. **100% accurate categorization** - Category comes from jobs.ge, not guessing
2. **Complete coverage** - Every region/category combination is parsed
3. **Simpler code** - No complex keyword matching logic
4. **Better tracking** - Know exactly which filter combination each job came from

---

## 2. Current Architecture Problems

### Problem 1: Keyword-Based Classification is Inaccurate
```
Current Flow:
1. Fetch job: "IT ინჟინერი"
2. Run keyword classifier
3. Hope it matches "it ინჟინერ" pattern
4. Might fail due to word variations
```

**Issues:**
- Georgian word forms vary (მხარდაჭერა vs მხარდაჭერის)
- False positives (HVAC ინჟინერი → IT category)
- False negatives (jobs without keywords → "other")
- Constant maintenance of keyword lists

### Problem 2: Single Region Filter
```
Current: Only parses lid=14 (Adjara)
Missing: Other 16 regions
```

### Problem 3: No Category Filter
```
Current: Fetches ALL jobs, then classifies
Better: Use jobs.ge cid parameter - they already classified!
```

---

## 3. New Architecture Design

### High-Level Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                      NEW PARSER ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  START                                                                   │
│    │                                                                     │
│    ▼                                                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  FOR EACH REGION (priority order):                                │   │
│  │    lid=14 (Adjara) → lid=1 (Tbilisi) → lid=8 (Imereti) → ...    │   │
│  │                                                                   │   │
│  │    ┌────────────────────────────────────────────────────────┐    │   │
│  │    │  FOR EACH CATEGORY:                                     │    │   │
│  │    │    cid=1 → cid=2 → cid=3 → ... → cid=18               │    │   │
│  │    │                                                         │    │   │
│  │    │    ┌──────────────────────────────────────────────┐    │    │   │
│  │    │    │  BUILD URL:                                   │    │    │   │
│  │    │    │  https://jobs.ge/ge/?cid={cid}&lid={lid}     │    │    │   │
│  │    │    │                                               │    │    │   │
│  │    │    │  FETCH JOB LIST                              │    │    │   │
│  │    │    │    │                                          │    │    │   │
│  │    │    │    ▼                                          │    │    │   │
│  │    │    │  FOR EACH JOB URL:                           │    │    │   │
│  │    │    │    - Check if URL exists in DB               │    │    │   │
│  │    │    │    - If new: fetch details, save             │    │    │   │
│  │    │    │    - If exists: update last_seen_at          │    │    │   │
│  │    │    │    - Category = KNOWN from cid               │    │    │   │
│  │    │    │    - Region = KNOWN from lid                 │    │    │   │
│  │    │    │                                               │    │    │   │
│  │    │    │  HANDLE PAGINATION (if page=2 exists)        │    │    │   │
│  │    │    └──────────────────────────────────────────────┘    │    │   │
│  │    └────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│    │                                                                     │
│    ▼                                                                     │
│  DEACTIVATE jobs not seen in 7 days                                     │
│    │                                                                     │
│    ▼                                                                     │
│  END - Log statistics                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Class Diagram
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           JobsGeParser                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ Attributes:                                                              │
│   - regions: List[RegionConfig]                                         │
│   - categories: List[CategoryConfig]                                    │
│   - category_mapping: Dict[int, str]  # cid → our slug                 │
│   - region_mapping: Dict[int, str]    # lid → our slug                 │
│   - http_client: HTTPClient                                             │
│   - rate_limit_delay: float = 2.0                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ Methods:                                                                 │
│   + run(regions: List[str] = None) → ParseResult                        │
│   + parse_region(lid: int) → RegionResult                               │
│   + parse_category(lid: int, cid: int) → CategoryResult                 │
│   + parse_list_page(lid: int, cid: int, page: int) → List[JobInfo]     │
│   + parse_job_detail(url: str) → JobData                                │
│   + has_next_page(html: str) → bool                                     │
│   - _build_filter_url(lid: int, cid: int, page: int) → str             │
│   - _extract_job_urls(html: str) → List[str]                           │
│   - _map_category(cid: int) → str                                       │
│   - _map_region(lid: int) → str                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. jobs.ge Filter System

### Categories (cid parameter)
| cid | Georgian Name | English Name | Our Slug |
|-----|---------------|--------------|----------|
| 1 | ადმინისტრაცია/მენეჯმენტი | Administration/Management | `hr-admin` |
| 2 | გაყიდვები | Sales | `sales-marketing` |
| 3 | ფინანსები/სტატისტიკა | Finance/Statistics | `finance-accounting` |
| 4 | PR/მარკეტინგი | PR/Marketing | `sales-marketing` |
| 5 | ლოგისტიკა/ტრანსპორტი/დისტრიბუცია | Logistics/Transport | `logistics-transport` |
| 6 | IT/პროგრამირება | IT/Programming | `it-programming` |
| 7 | სამართალი | Law | `legal` |
| 8 | მედიცინა/ფარმაცია | Medicine/Pharmacy | `medicine-healthcare` |
| 9 | სხვა | Other | `other` |
| 10 | კვება | Food/Catering | `tourism-hospitality` |
| 11 | მშენებლობა/რემონტი | Construction/Repair | `construction` |
| 12 | განათლება | Education | `education` |
| 13 | მედია/გამომცემლობა | Media/Publishing | `media-journalism` |
| 14 | სილამაზე/მოდა | Beauty/Fashion | `other` |
| 16 | დასუფთავება | Cleaning | `cleaning` |
| 17 | დაცვა/უსაფრთხოება | Security/Safety | `security` |
| 18 | ზოგადი ტექნიკური პერსონალი | General Technical Staff | `manufacturing` |

### Regions (lid parameter)
| lid | Georgian Name | English Name | Priority | Our Slug |
|-----|---------------|--------------|----------|----------|
| 14 | აჭარის ა/რ | Adjara AR | 1 | `adjara` |
| 1 | თბილისი | Tbilisi | 2 | `tbilisi` |
| 8 | იმერეთი | Imereti | 3 | `imereti` |
| 3 | კახეთი | Kakheti | 4 | `kakheti` |
| 5 | ქვემო ქართლი | Kvemo Kartli | 5 | `kvemo-kartli` |
| 6 | შიდა ქართლი | Shida Kartli | 6 | `shida-kartli` |
| 9 | გურია | Guria | 7 | `guria` |
| 7 | სამცხე-ჯავახეთი | Samtskhe-Javakheti | 8 | `samtskhe-javakheti` |
| 4 | მცხეთა-მთიანეთი | Mtskheta-Mtianeti | 9 | `mtskheta-mtianeti` |
| 13 | სამეგრელო-ზემო სვანეთი | Samegrelo | 10 | `samegrelo` |
| 12 | რაჭა-ლეჩხუმი | Racha-Lechkhumi | 11 | `racha-lechkhumi` |
| 15 | აფხაზეთის ა/რ | Abkhazia AR | 12 | `abkhazia` |
| 16 | უცხოეთი | Abroad | 13 | `abroad` |
| 17 | დისტანციური | Remote | 14 | `remote` |

### URL Format
```
Base URL: https://jobs.ge/ge/

Parameters:
  - cid: Category ID (1-18)
  - lid: Location/Region ID (1-17)
  - page: Page number (1, 2, 3...)
  - q: Search query (optional)
  - jid: Job type (1=vacancies, 2=scholarships, etc.)

Examples:
  IT jobs in Adjara:        https://jobs.ge/ge/?cid=6&lid=14
  Sales jobs in Tbilisi:    https://jobs.ge/ge/?cid=2&lid=1
  IT jobs in Adjara page 2: https://jobs.ge/ge/?cid=6&lid=14&page=2
```

---

## 5. Database Schema Changes

### New Columns for `jobs` Table
```sql
-- Add columns to track original jobs.ge filter values
ALTER TABLE jobs ADD COLUMN jobsge_cid INTEGER;
ALTER TABLE jobs ADD COLUMN jobsge_lid INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN jobs.jobsge_cid IS 'Original jobs.ge category ID (cid parameter)';
COMMENT ON COLUMN jobs.jobsge_lid IS 'Original jobs.ge location ID (lid parameter)';

-- Create index for filtering by original source
CREATE INDEX idx_jobs_jobsge_cid ON jobs (jobsge_cid);
CREATE INDEX idx_jobs_jobsge_lid ON jobs (jobsge_lid);

-- Ensure source_url is unique for deduplication
CREATE UNIQUE INDEX uix_jobs_source_url ON jobs (source_url)
WHERE source_url IS NOT NULL;
```

### Alembic Migration
```python
"""Add jobsge_cid and jobsge_lid columns

Revision ID: 20260120_jobsge_filters
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('jobs', sa.Column('jobsge_cid', sa.Integer(), nullable=True))
    op.add_column('jobs', sa.Column('jobsge_lid', sa.Integer(), nullable=True))
    op.create_index('idx_jobs_jobsge_cid', 'jobs', ['jobsge_cid'])
    op.create_index('idx_jobs_jobsge_lid', 'jobs', ['jobsge_lid'])

def downgrade():
    op.drop_index('idx_jobs_jobsge_lid', 'jobs')
    op.drop_index('idx_jobs_jobsge_cid', 'jobs')
    op.drop_column('jobs', 'jobsge_lid')
    op.drop_column('jobs', 'jobsge_cid')
```

---

## 6. Parser Implementation Details

### 6.1 Configuration File: `jobsge_config.py`
```python
"""jobs.ge parser configuration - categories and regions mapping."""

from dataclasses import dataclass
from typing import List, Dict

@dataclass
class CategoryConfig:
    """jobs.ge category configuration."""
    cid: int                    # jobs.ge category ID
    name_ge: str               # Georgian name
    name_en: str               # English name
    our_slug: str              # Our category slug

@dataclass
class RegionConfig:
    """jobs.ge region configuration."""
    lid: int                    # jobs.ge location ID
    name_ge: str               # Georgian name
    name_en: str               # English name
    our_slug: str              # Our region slug
    priority: int              # Parse order (1 = first)
    enabled: bool = True       # Whether to parse this region

# Category mapping: jobs.ge cid → our slug
JOBSGE_CATEGORIES: List[CategoryConfig] = [
    CategoryConfig(1, "ადმინისტრაცია/მენეჯმენტი", "Administration/Management", "hr-admin"),
    CategoryConfig(2, "გაყიდვები", "Sales", "sales-marketing"),
    CategoryConfig(3, "ფინანსები/სტატისტიკა", "Finance/Statistics", "finance-accounting"),
    CategoryConfig(4, "PR/მარკეტინგი", "PR/Marketing", "sales-marketing"),
    CategoryConfig(5, "ლოგისტიკა/ტრანსპორტი/დისტრიბუცია", "Logistics/Transport", "logistics-transport"),
    CategoryConfig(6, "IT/პროგრამირება", "IT/Programming", "it-programming"),
    CategoryConfig(7, "სამართალი", "Law", "legal"),
    CategoryConfig(8, "მედიცინა/ფარმაცია", "Medicine/Pharmacy", "medicine-healthcare"),
    CategoryConfig(9, "სხვა", "Other", "other"),
    CategoryConfig(10, "კვება", "Food/Catering", "tourism-hospitality"),
    CategoryConfig(11, "მშენებლობა/რემონტი", "Construction/Repair", "construction"),
    CategoryConfig(12, "განათლება", "Education", "education"),
    CategoryConfig(13, "მედია/გამომცემლობა", "Media/Publishing", "media-journalism"),
    CategoryConfig(14, "სილამაზე/მოდა", "Beauty/Fashion", "design-creative"),
    CategoryConfig(16, "დასუფთავება", "Cleaning", "cleaning"),
    CategoryConfig(17, "დაცვა/უსაფრთხოება", "Security/Safety", "security"),
    CategoryConfig(18, "ზოგადი ტექნიკური პერსონალი", "General Technical Staff", "manufacturing"),
]

# Region mapping: jobs.ge lid → our slug
JOBSGE_REGIONS: List[RegionConfig] = [
    RegionConfig(14, "აჭარის ა/რ", "Adjara AR", "adjara", priority=1),
    RegionConfig(1, "თბილისი", "Tbilisi", "tbilisi", priority=2),
    RegionConfig(8, "იმერეთი", "Imereti", "imereti", priority=3),
    RegionConfig(3, "კახეთი", "Kakheti", "kakheti", priority=4),
    RegionConfig(5, "ქვემო ქართლი", "Kvemo Kartli", "kvemo-kartli", priority=5),
    RegionConfig(6, "შიდა ქართლი", "Shida Kartli", "shida-kartli", priority=6),
    RegionConfig(9, "გურია", "Guria", "guria", priority=7),
    RegionConfig(7, "სამცხე-ჯავახეთი", "Samtskhe-Javakheti", "samtskhe-javakheti", priority=8),
    RegionConfig(4, "მცხეთა-მთიანეთი", "Mtskheta-Mtianeti", "mtskheta-mtianeti", priority=9),
    RegionConfig(13, "სამეგრელო-ზემო სვანეთი", "Samegrelo", "samegrelo", priority=10),
    RegionConfig(12, "რაჭა-ლეჩხუმი", "Racha-Lechkhumi", "racha-lechkhumi", priority=11),
    RegionConfig(15, "აფხაზეთის ა/რ", "Abkhazia AR", "abkhazia", priority=12, enabled=False),
    RegionConfig(16, "უცხოეთი", "Abroad", "abroad", priority=13, enabled=False),
    RegionConfig(17, "დისტანციური", "Remote", "remote", priority=14),
]

def get_category_by_cid(cid: int) -> CategoryConfig:
    """Get category config by jobs.ge cid."""
    for cat in JOBSGE_CATEGORIES:
        if cat.cid == cid:
            return cat
    return None

def get_region_by_lid(lid: int) -> RegionConfig:
    """Get region config by jobs.ge lid."""
    for reg in JOBSGE_REGIONS:
        if reg.lid == lid:
            return reg
    return None

def get_enabled_regions() -> List[RegionConfig]:
    """Get list of enabled regions sorted by priority."""
    return sorted(
        [r for r in JOBSGE_REGIONS if r.enabled],
        key=lambda r: r.priority
    )
```

### 6.2 Main Parser: `jobs_ge.py`
```python
"""jobs.ge parser - Filter-based approach.

Iterates through region/category combinations using jobs.ge's native filters.
Category and region are determined by URL parameters, not keyword matching.
"""
import re
from datetime import datetime
from typing import AsyncIterator, List, Optional, Dict, Any
from urllib.parse import urljoin, urlparse, parse_qs
from bs4 import BeautifulSoup

from app.core.base_adapter import BaseAdapter, JobData
from app.core.http_client import HTTPClient
from app.core.utils import clean_html, compute_content_hash, extract_date, extract_salary
from app.parsers.jobsge_config import (
    JOBSGE_CATEGORIES,
    JOBSGE_REGIONS,
    get_category_by_cid,
    get_region_by_lid,
    get_enabled_regions,
    CategoryConfig,
    RegionConfig,
)


class JobsGeParser(BaseAdapter):
    """Parser for jobs.ge using native filter parameters.

    Strategy:
    1. Iterate through each enabled region (starting with Adjara)
    2. For each region, iterate through all categories
    3. Fetch jobs using filter URL: https://jobs.ge/ge/?cid={cid}&lid={lid}
    4. Category and region are KNOWN from URL parameters
    5. Handle pagination if multiple pages exist
    6. Deduplicate by source_url
    """

    source_name = "jobs.ge"
    source_domain = "jobs.ge"
    base_url = "https://jobs.ge"
    rate_limit_delay = 2.0
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

    def __init__(self):
        self.categories = JOBSGE_CATEGORIES
        self.regions = get_enabled_regions()

    async def run(self, regions: Optional[List[str]] = None) -> "ParseResult":
        """Execute full parsing run through all region/category combinations.

        Args:
            regions: Optional list of region slugs to parse (default: all enabled)

        Returns:
            ParseResult with all parsed jobs and statistics
        """
        from app.core.base_adapter import ParseResult

        result = ParseResult()

        # Filter regions if specified
        regions_to_parse = self.regions
        if regions:
            regions_to_parse = [r for r in self.regions if r.our_slug in regions]

        async with HTTPClient(
            rate_limit_delay=self.rate_limit_delay,
            user_agent=self.user_agent
        ) as client:
            self.client = client

            for region in regions_to_parse:
                region_result = await self._parse_region(region)
                result.jobs.extend(region_result.jobs)
                result.errors.extend(region_result.errors)
                result.pages_parsed += region_result.pages_parsed

        result.total_found = len(result.jobs)
        return result

    async def _parse_region(self, region: RegionConfig) -> "ParseResult":
        """Parse all categories for a single region.

        Args:
            region: Region configuration

        Returns:
            ParseResult for this region
        """
        from app.core.base_adapter import ParseResult

        result = ParseResult()

        for category in self.categories:
            try:
                cat_result = await self._parse_category(region, category)
                result.jobs.extend(cat_result.jobs)
                result.errors.extend(cat_result.errors)
                result.pages_parsed += cat_result.pages_parsed
            except Exception as e:
                result.errors.append(
                    f"Error parsing {region.name_en}/{category.name_en}: {str(e)}"
                )

        return result

    async def _parse_category(
        self,
        region: RegionConfig,
        category: CategoryConfig
    ) -> "ParseResult":
        """Parse all jobs for a specific region/category combination.

        Handles pagination automatically.

        Args:
            region: Region configuration
            category: Category configuration

        Returns:
            ParseResult for this category
        """
        from app.core.base_adapter import ParseResult

        result = ParseResult()
        page = 1
        seen_urls = set()

        while True:
            # Build filter URL
            url = self._build_filter_url(region.lid, category.cid, page)

            try:
                html = await self.client.get_text(url)
                result.pages_parsed += 1

                # Extract job URLs from list
                job_urls = self._extract_job_urls(html)

                # If no jobs found, stop pagination
                if not job_urls:
                    break

                # Parse each job
                for job_url in job_urls:
                    # Skip if already seen (within this run)
                    if job_url in seen_urls:
                        continue
                    seen_urls.add(job_url)

                    try:
                        job = await self._parse_job_detail(
                            job_url,
                            region,
                            category
                        )
                        if job:
                            result.jobs.append(job)
                    except Exception as e:
                        result.errors.append(f"Error parsing {job_url}: {str(e)}")

                # Check for next page
                if not self._has_next_page(html, page):
                    break

                page += 1

            except Exception as e:
                result.errors.append(f"Error fetching {url}: {str(e)}")
                break

        return result

    def _build_filter_url(self, lid: int, cid: int, page: int = 1) -> str:
        """Build jobs.ge filter URL.

        Args:
            lid: Location/region ID
            cid: Category ID
            page: Page number

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
            List of absolute job URLs
        """
        soup = BeautifulSoup(html, "lxml")
        urls = []
        seen_ids = set()

        # Find all job links (href contains "view=jobs&id=")
        for link in soup.find_all("a", href=True):
            href = link["href"]
            if "id=" in href and "view=jobs" in href:
                # Extract job ID
                match = re.search(r'id=(\d+)', href)
                if match:
                    job_id = match.group(1)
                    if job_id not in seen_ids:
                        seen_ids.add(job_id)
                        # Build absolute URL
                        full_url = f"{self.base_url}/ge/?view=jobs&id={job_id}"
                        urls.append(full_url)

        return urls

    def _has_next_page(self, html: str, current_page: int) -> bool:
        """Check if there's a next page of results.

        Args:
            html: HTML content
            current_page: Current page number

        Returns:
            True if next page exists
        """
        soup = BeautifulSoup(html, "lxml")

        # Look for pagination links
        next_page = current_page + 1
        for link in soup.find_all("a", href=True):
            if f"page={next_page}" in link["href"]:
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
            url: Job detail URL
            region: Region this job was found in
            category: Category this job was found in

        Returns:
            JobData or None if parsing failed
        """
        try:
            # Fetch Georgian version
            html_ge = await self.client.get_text(url)
            soup = BeautifulSoup(html_ge, "lxml")

            # Extract title
            title = self._extract_title(soup)
            if not title:
                return None

            # Extract body
            body = self._extract_body(soup)

            # Extract company
            company_name = self._extract_company(soup)

            # Extract dates
            published_at = self._extract_published_date(soup)
            deadline_at = self._extract_deadline_date(soup)

            # Extract salary
            salary_min, salary_max, salary_currency = self._extract_salary_info(soup)

            # Extract job ID
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
                pass

            # Compute content hash
            content_hash = compute_content_hash(title, body, company_name)

            return JobData(
                external_id=external_id,
                source_url=url,
                title_ge=title,
                title_en=title_en,
                body_ge=body,
                body_en=body_en,
                company_name=company_name,
                location=region.name_ge,
                category_slug=category.our_slug,
                jobsge_cid=category.cid,
                jobsge_lid=region.lid,
                parsed_from=self.source_name,
                published_at=published_at,
                deadline_at=deadline_at,
                has_salary=salary_min is not None,
                salary_min=salary_min,
                salary_max=salary_max,
                salary_currency=salary_currency or "GEL",
                content_hash=content_hash,
            )

        except Exception:
            return None

    def _extract_title(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract job title from page."""
        for selector in ["h1", "h2", ".title", ".job-title", "td b", "td strong"]:
            elem = soup.select_one(selector)
            if elem:
                text = elem.get_text(strip=True)
                if text and len(text) > 5:
                    return text

        # Fallback: page title
        title_tag = soup.find("title")
        if title_tag:
            return title_tag.get_text(strip=True).split("|")[0].strip()

        return None

    def _extract_body(self, soup: BeautifulSoup) -> str:
        """Extract job description from page."""
        for selector in [".description", ".job-description", ".content",
                        "article", "td[colspan]", ".vacancy-text"]:
            elem = soup.select_one(selector)
            if elem:
                body = clean_html(str(elem))
                if len(body) > 100:
                    return body

        # Fallback: main content
        main = soup.select_one("main, #content, .main, body")
        if main:
            for tag in main.select("script, style, nav, header, footer"):
                tag.decompose()
            return clean_html(str(main))

        return ""

    def _extract_company(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract company name from page."""
        # Look for company link/section
        for selector in [".company-name", ".employer", 'a[href*="org="]']:
            elem = soup.select_one(selector)
            if elem:
                text = elem.get_text(strip=True)
                # Skip navigation links
                if text and "ყველა" not in text and "ორგანიზაცია" not in text:
                    return text

        return None

    def _extract_published_date(self, soup: BeautifulSoup) -> Optional[datetime]:
        """Extract published date."""
        # Look for date patterns in page
        text = soup.get_text()
        return extract_date(text)

    def _extract_deadline_date(self, soup: BeautifulSoup) -> Optional[datetime]:
        """Extract deadline date."""
        # Look for deadline-specific text
        for elem in soup.find_all(string=re.compile(r'ბოლო.*ვადა|deadline', re.I)):
            parent = elem.parent
            if parent:
                date = extract_date(parent.get_text())
                if date:
                    return date
        return None

    def _extract_salary_info(self, soup: BeautifulSoup):
        """Extract salary information."""
        text = soup.get_text()
        return extract_salary(text)

    def _extract_id_from_url(self, url: str) -> Optional[str]:
        """Extract job ID from URL."""
        match = re.search(r'id=(\d+)', url)
        return match.group(1) if match else None
```

---

## 7. Configuration

### Environment Variables
```bash
# .env file

# Regions to parse (comma-separated slugs, or "all")
# Default: adjara (Batumi area only)
PARSE_REGIONS=adjara

# To enable all regions:
# PARSE_REGIONS=all

# To parse specific regions:
# PARSE_REGIONS=adjara,tbilisi,imereti

# Parser schedule (minutes between runs)
PARSER_INTERVAL_MINUTES=60

# Rate limiting (seconds between requests)
RATE_LIMIT_DELAY=2.0

# Days before marking job as inactive
NOT_SEEN_DAYS_TO_INACTIVE=7
```

### Config Parser Updates
```python
# config.py additions

def _parse_regions(value: str) -> List[str]:
    """Parse PARSE_REGIONS env var."""
    value = value.strip().lower()
    if not value or value == "all":
        return []  # Empty = all regions
    return [r.strip() for r in value.split(",") if r.strip()]
```

---

## 8. Deduplication Strategy

### Primary: source_url
```python
# Each job has a unique URL
source_url = "https://jobs.ge/ge/?view=jobs&id=693885"

# Check before insert
existing = await db.query(Job).filter(Job.source_url == source_url).first()
if existing:
    existing.last_seen_at = datetime.utcnow()
    # Optionally update other fields if content_hash changed
else:
    # Insert new job
```

### Secondary: external_id + parsed_from
```python
# Backup deduplication
existing = await db.query(Job).filter(
    Job.parsed_from == "jobs.ge",
    Job.external_id == "693885"
).first()
```

### Handling Duplicates Across Regions
A job might appear in multiple regions (e.g., "Remote" jobs appear everywhere).

**Strategy:** First region wins
```python
# If job URL already exists, skip (keep original region)
if await self._job_exists(job_url):
    continue
```

---

## 9. Error Handling

### Retry Logic
```python
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(HTTPError)
)
async def fetch_with_retry(self, url: str) -> str:
    return await self.client.get_text(url)
```

### Error Logging
```python
# Per-job errors
result.errors.append(f"Failed to parse {url}: {error}")

# Per-category summary
logger.warning(
    "category_parse_failed",
    region=region.name_en,
    category=category.name_en,
    error_count=len(errors)
)
```

### Graceful Degradation
- If one category fails, continue with others
- If one region fails, continue with others
- Log all errors for debugging

---

## 10. Testing Plan

### Unit Tests
```python
# test_jobs_ge_parser.py

class TestJobsGeParser:

    def test_build_filter_url(self):
        parser = JobsGeParser()
        url = parser._build_filter_url(lid=14, cid=6, page=1)
        assert url == "https://jobs.ge/ge/?cid=6&lid=14"

        url = parser._build_filter_url(lid=14, cid=6, page=2)
        assert url == "https://jobs.ge/ge/?cid=6&lid=14&page=2"

    def test_extract_job_urls(self):
        html = '''
        <a href="/ge/?view=jobs&id=123">Job 1</a>
        <a href="/ge/?view=jobs&id=456">Job 2</a>
        '''
        parser = JobsGeParser()
        urls = parser._extract_job_urls(html)
        assert len(urls) == 2
        assert "id=123" in urls[0]

    def test_category_mapping(self):
        from app.parsers.jobsge_config import get_category_by_cid

        cat = get_category_by_cid(6)
        assert cat.our_slug == "it-programming"

        cat = get_category_by_cid(2)
        assert cat.our_slug == "sales-marketing"

    def test_region_priority(self):
        from app.parsers.jobsge_config import get_enabled_regions

        regions = get_enabled_regions()
        assert regions[0].lid == 14  # Adjara first
        assert regions[0].our_slug == "adjara"
```

### Integration Tests
```python
@pytest.mark.integration
async def test_parse_adjara_it_category():
    """Test parsing IT jobs in Adjara."""
    parser = JobsGeParser()

    # Parse only Adjara, only IT
    result = await parser._parse_category(
        region=get_region_by_lid(14),
        category=get_category_by_cid(6)
    )

    assert result.errors == []
    assert len(result.jobs) > 0

    for job in result.jobs:
        assert job.category_slug == "it-programming"
        assert job.jobsge_lid == 14
        assert job.jobsge_cid == 6
```

---

## 11. Migration Plan

### Step 1: Database Migration
```bash
# Create migration
cd worker
alembic revision --autogenerate -m "Add jobsge_cid and jobsge_lid columns"

# Apply migration
alembic upgrade head
```

### Step 2: Deploy New Parser
```bash
# On server
cd /opt/batumi-work/compose-project
git pull

# Rebuild worker
docker compose build worker

# Restart
docker compose up -d worker
```

### Step 3: Re-parse All Jobs
```bash
# Clear existing jobs (they have wrong categories)
docker compose exec db psql -U jobboard -d jobboard -c \
  "DELETE FROM jobs;"

# Run parser once
docker compose --profile parser run --rm worker python -m app.main --once
```

### Step 4: Verify
```bash
# Check category distribution
docker compose exec db psql -U jobboard -d jobboard -c \
  "SELECT c.slug, COUNT(*) FROM jobs j
   JOIN categories c ON j.category_id = c.id
   GROUP BY c.slug ORDER BY COUNT(*) DESC;"

# Check jobs have jobsge_cid/lid
docker compose exec db psql -U jobboard -d jobboard -c \
  "SELECT title_ge, jobsge_cid, jobsge_lid FROM jobs LIMIT 10;"
```

---

## 12. File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `worker/app/parsers/jobsge_config.py` | CREATE | Category/region mapping configuration |
| `worker/app/parsers/jobs_ge.py` | REWRITE | New filter-based parser |
| `worker/app/core/utils.py` | MODIFY | Remove classify_category function |
| `worker/app/core/base_adapter.py` | MODIFY | Add jobsge_cid, jobsge_lid to JobData |
| `worker/app/core/runner.py` | MODIFY | Update to use new parser |
| `api/app/models/job.py` | MODIFY | Add jobsge_cid, jobsge_lid columns |
| `api/alembic/versions/xxx_add_jobsge_fields.py` | CREATE | Migration for new columns |
| `worker/tests/unit/test_jobs_ge_parser.py` | CREATE | Unit tests |
| `worker/tests/integration/test_parser_integration.py` | CREATE | Integration tests |
| `worker/PARSER_REDESIGN.md` | CREATE | This document |

---

## Appendix: Quick Reference

### URL Patterns
```
List:   https://jobs.ge/ge/?cid={cid}&lid={lid}&page={page}
Detail: https://jobs.ge/ge/?view=jobs&id={job_id}
```

### Category Quick Lookup
```
IT/Programming:     cid=6  → it-programming
Sales:              cid=2  → sales-marketing
Finance:            cid=3  → finance-accounting
Administration:     cid=1  → hr-admin
Logistics:          cid=5  → logistics-transport
```

### Region Quick Lookup
```
Adjara:    lid=14 (priority 1)
Tbilisi:   lid=1  (priority 2)
Remote:    lid=17 (priority 14)
```

---

*Document created: January 20, 2026*
