import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import Job, Company, Industry, Location, Specialization, ParserRun
from app.parser.client import HRGeClient
from app.parser.sitemap import SitemapParser
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class JobScraper:
    """Main scraper that orchestrates job fetching and database updates."""

    def __init__(self, db: Session):
        self.db = db
        self.client = HRGeClient()
        self.sitemap = SitemapParser()
        self.concurrent_requests = settings.parser_concurrent_requests

    def _parse_datetime(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse datetime string from API."""
        if not date_str:
            return None
        try:
            # Handle various date formats from API
            for fmt in ["%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"]:
                try:
                    return datetime.strptime(date_str.rstrip("Z"), fmt.rstrip("Z"))
                except ValueError:
                    continue
            return None
        except Exception:
            return None

    async def _get_or_create_company(self, job_data: Dict[str, Any]) -> Optional[int]:
        """Get or create company from job data."""
        # API returns customerId and customerName directly in job data
        external_id = job_data.get("customerId")
        if not external_id:
            return None

        customer_name = job_data.get("customerName") or "Unknown"
        customer_logo = job_data.get("customerLogoUrl")
        is_anonymous = job_data.get("isAnonymous", False)

        # Check if company exists
        existing = self.db.execute(
            select(Company).where(Company.external_id == external_id)
        ).scalar_one_or_none()

        if existing:
            # Update company data
            existing.name = customer_name
            existing.logo_url = customer_logo or existing.logo_url
            existing.is_anonymous = is_anonymous
            existing.updated_at = datetime.utcnow()
            return existing.id

        # Create new company
        company = Company(
            external_id=external_id,
            name=customer_name,
            logo_url=customer_logo,
            is_anonymous=is_anonymous,
        )
        self.db.add(company)
        self.db.flush()
        return company.id

    def _extract_addresses(self, job_data: Dict[str, Any]) -> List[str]:
        """Extract address names from job data."""
        addresses = []
        for addr in job_data.get("addresses", []):
            if isinstance(addr, dict):
                name = addr.get("name") or addr.get("name_en")
                if name:
                    addresses.append(name)
            elif isinstance(addr, str):
                addresses.append(addr)
        return addresses

    def _extract_languages(self, job_data: Dict[str, Any]) -> List[str]:
        """Extract language names from job data."""
        languages = []
        for lang in job_data.get("languages", []):
            if isinstance(lang, dict):
                name = lang.get("name") or lang.get("name_en")
                if name:
                    languages.append(name)
            elif isinstance(lang, str):
                languages.append(lang)
        return languages

    async def _process_job(self, job_id: int) -> Dict[str, str]:
        """Process a single job: fetch from API and save to database."""
        try:
            job_data = await self.client.get_job(job_id)
            if not job_data:
                return {"status": "not_found", "id": job_id}

            # Check if job exists
            existing = self.db.execute(
                select(Job).where(Job.external_id == job_id)
            ).scalar_one_or_none()

            # Get or create company
            company_id = await self._get_or_create_company(job_data)

            # Extract data - API uses camelCase
            title = job_data.get("title") or "Untitled"
            addresses = self._extract_addresses(job_data)
            languages = self._extract_languages(job_data)

            # Get salary info - API uses salaryFrom/salaryTo directly
            salary_from = job_data.get("salaryFrom")
            salary_to = job_data.get("salaryTo")

            # Get contact info - API uses different field names
            contact_phone = job_data.get("contactPhoneNumber") or job_data.get("contactMobilePhoneNumber")

            # Check if salary should be hidden
            hide_salary = job_data.get("hideSalary")
            show_salary = not hide_salary if hide_salary is not None else True

            job_fields = {
                "external_id": job_id,
                "company_id": company_id,
                "title": title[:500],
                "title_en": None,  # API doesn't provide English title separately
                "description": job_data.get("description"),
                "slug": None,
                "publish_date": self._parse_datetime(job_data.get("publishDate")),
                "deadline_date": self._parse_datetime(job_data.get("deadlineDate")),
                "renewal_date": self._parse_datetime(job_data.get("renewalDate")),
                "salary_from": salary_from,
                "salary_to": salary_to,
                "salary_currency": "GEL",
                "show_salary": show_salary,
                "is_with_bonus": job_data.get("isWithBonus", False),
                "is_work_from_home": job_data.get("isWorkFromHome", False),
                "is_suitable_for_student": job_data.get("isSuitableForStudent", False),
                "employment_type": None,
                "work_schedule": None,
                "contact_email": job_data.get("contactEmail"),
                "contact_phone": contact_phone,
                "contact_name": job_data.get("contactName"),
                "hide_contact_person": job_data.get("hideContactPerson", False),
                "is_expired": False,  # We're fetching from sitemap, so jobs are active
                "is_priority": False,
                "application_method": job_data.get("applicationMethod"),
                "languages": languages if languages else None,
                "addresses": addresses if addresses else None,
                "benefits": None,
                "driving_licenses": job_data.get("drivingLicenses"),
                "raw_json": job_data,
                "last_scraped_at": datetime.utcnow(),
            }

            if existing:
                # Update existing job
                for key, value in job_fields.items():
                    if key != "external_id":
                        setattr(existing, key, value)
                existing.updated_at = datetime.utcnow()
                return {"status": "updated", "id": job_id}
            else:
                # Create new job
                job = Job(**job_fields)
                self.db.add(job)
                return {"status": "created", "id": job_id}

        except Exception as e:
            logger.error(f"Error processing job {job_id}: {e}")
            return {"status": "failed", "id": job_id, "error": str(e)}

    async def run_full_scrape(self, run_id: Optional[int] = None) -> Dict[str, int]:
        """Run a full scrape of all jobs from sitemap."""
        stats = {
            "found": 0,
            "created": 0,
            "updated": 0,
            "failed": 0,
        }

        try:
            # Get all job IDs from sitemap
            job_ids = await self.sitemap.get_all_job_ids()
            stats["found"] = len(job_ids)
            logger.info(f"Starting full scrape of {len(job_ids)} jobs")

            # Process jobs in batches
            batch_size = self.concurrent_requests
            for i in range(0, len(job_ids), batch_size):
                batch = job_ids[i:i + batch_size]
                tasks = [self._process_job(job_id) for job_id in batch]
                results = await asyncio.gather(*tasks, return_exceptions=True)

                for result in results:
                    if isinstance(result, Exception):
                        stats["failed"] += 1
                        logger.error(f"Batch processing error: {result}")
                    elif isinstance(result, dict):
                        status = result.get("status")
                        if status == "created":
                            stats["created"] += 1
                        elif status == "updated":
                            stats["updated"] += 1
                        elif status in ("failed", "not_found"):
                            stats["failed"] += 1

                # Commit batch
                self.db.commit()
                logger.info(f"Processed batch {i // batch_size + 1}/{(len(job_ids) + batch_size - 1) // batch_size}")

        except Exception as e:
            logger.error(f"Full scrape failed: {e}")
            self.db.rollback()
            raise

        return stats

    async def run_incremental_scrape(self, max_pages: int = 5) -> Dict[str, int]:
        """Run an incremental scrape of recent jobs from API listing."""
        stats = {
            "found": 0,
            "created": 0,
            "updated": 0,
            "failed": 0,
        }

        try:
            for page in range(1, max_pages + 1):
                logger.info(f"Fetching page {page} of job listings")
                data = await self.client.get_jobs_list(page=page, per_page=50)

                jobs_list = data.get("data", [])
                if not jobs_list:
                    break

                stats["found"] += len(jobs_list)

                for job_data in jobs_list:
                    job_id = job_data.get("id")
                    if job_id:
                        result = await self._process_job(job_id)
                        status = result.get("status")
                        if status == "created":
                            stats["created"] += 1
                        elif status == "updated":
                            stats["updated"] += 1
                        elif status == "failed":
                            stats["failed"] += 1

                self.db.commit()

        except Exception as e:
            logger.error(f"Incremental scrape failed: {e}")
            self.db.rollback()
            raise

        return stats


async def run_parser(db: Session, run_type: str = "full") -> Dict[str, Any]:
    """Run the parser and track the run."""
    # Create parser run record
    parser_run = ParserRun(run_type=run_type)
    db.add(parser_run)
    db.commit()
    db.refresh(parser_run)

    scraper = JobScraper(db)

    try:
        if run_type == "full":
            stats = await scraper.run_full_scrape(parser_run.id)
        else:
            stats = await scraper.run_incremental_scrape()

        # Update run record
        parser_run.status = "completed"
        parser_run.finished_at = datetime.utcnow()
        parser_run.jobs_found = stats["found"]
        parser_run.jobs_created = stats["created"]
        parser_run.jobs_updated = stats["updated"]
        parser_run.jobs_failed = stats["failed"]
        db.commit()

        logger.info(f"Parser run completed: {stats}")
        return {"run_id": parser_run.id, "status": "completed", **stats}

    except Exception as e:
        parser_run.status = "failed"
        parser_run.finished_at = datetime.utcnow()
        parser_run.error_message = str(e)
        db.commit()

        logger.error(f"Parser run failed: {e}")
        return {"run_id": parser_run.id, "status": "failed", "error": str(e)}
