"""Message formatting service for Telegram channel posts."""
import re
from typing import Any, Dict

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class FormatterService:
    """Formats job postings into Telegram channel messages."""

    @staticmethod
    def format_category_hashtag(category_name_ge: str) -> str:
        """Convert Georgian category name to hashtag format.

        Example: "IT და პროგრამირება" -> "#IT_და_პროგრამირება"
        """
        # Replace spaces with underscores
        hashtag = category_name_ge.replace(" ", "_")
        # Remove any characters that aren't valid in hashtags (keep Georgian letters, numbers, underscores)
        hashtag = re.sub(r'[^\w\u10A0-\u10FF]', '', hashtag, flags=re.UNICODE)
        return f"#{hashtag}"

    @staticmethod
    def format_remote_hashtag(remote_type: str) -> str:
        """Get remote work hashtag if applicable."""
        if remote_type and remote_type.lower() != "onsite":
            return "#Remote"
        return ""

    @staticmethod
    def format_salary(
        has_salary: bool,
        salary_min: int | None,
        salary_max: int | None,
        salary_currency: str = "GEL",
    ) -> str:
        """Format salary line if available."""
        if not has_salary:
            return ""

        if salary_min and salary_max:
            if salary_min == salary_max:
                return f"Salary: {salary_min} {salary_currency}"
            return f"Salary: {salary_min}-{salary_max} {salary_currency}"
        elif salary_min:
            return f"Salary: {salary_min}+ {salary_currency}"
        elif salary_max:
            return f"Salary: up to {salary_max} {salary_currency}"
        return ""

    @staticmethod
    def format_job_url(job_id: str) -> str:
        """Generate job URL."""
        base_url = settings.WEB_URL.rstrip("/")
        return f"{base_url}/ge/job.html?id={job_id}"

    @classmethod
    def format_message(cls, job_data: Dict[str, Any]) -> str:
        """Format a complete Telegram message for a job posting.

        Expected job_data keys:
        - id: UUID
        - title_ge: str
        - company_name: str (optional)
        - category_name_ge: str
        - remote_type: str (onsite/remote/hybrid)
        - has_salary: bool
        - salary_min: int (optional)
        - salary_max: int (optional)
        - salary_currency: str (default GEL)

        Returns formatted message like:
        ```
        #IT_და_პროგრამირება #Remote
        Senior React Developer
        Company: XYZ
        Salary: 3000-5000 GEL
        Apply: https://batumi.work/ge/job.html?id=UUID
        ```
        """
        lines = []

        # Line 1: Hashtags
        hashtags = [cls.format_category_hashtag(job_data.get("category_name_ge", "სხვა"))]
        remote_tag = cls.format_remote_hashtag(job_data.get("remote_type", "onsite"))
        if remote_tag:
            hashtags.append(remote_tag)
        lines.append(" ".join(hashtags))

        # Line 2: Job title
        lines.append(job_data.get("title_ge", ""))

        # Line 3: Company (if available)
        company_name = job_data.get("company_name")
        if company_name:
            lines.append(f"Company: {company_name}")

        # Line 4: Salary (if available)
        salary_line = cls.format_salary(
            job_data.get("has_salary", False),
            job_data.get("salary_min"),
            job_data.get("salary_max"),
            job_data.get("salary_currency", "GEL"),
        )
        if salary_line:
            lines.append(salary_line)

        # Line 5: Apply link
        job_id = str(job_data.get("id", ""))
        if job_id:
            lines.append(f"Apply: {cls.format_job_url(job_id)}")

        return "\n".join(lines)
