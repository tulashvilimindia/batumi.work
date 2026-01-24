import re
import logging
from typing import List, Set
import httpx
from bs4 import BeautifulSoup
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class SitemapParser:
    """Parser for HR.GE sitemap to extract job IDs."""

    def __init__(self):
        self.sitemap_url = settings.hr_ge_sitemap_url
        # Pattern to extract job ID from URL like /announcement/123456/some-job-title
        self.job_id_pattern = re.compile(r'/announcement/(\d+)/')

    async def fetch_sitemap(self) -> str:
        """Fetch the sitemap XML content."""
        logger.info(f"Fetching sitemap from {self.sitemap_url}")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(self.sitemap_url)
            response.raise_for_status()
            return response.text

    def parse_job_ids(self, xml_content: str) -> Set[int]:
        """Parse job IDs from sitemap XML."""
        soup = BeautifulSoup(xml_content, 'lxml-xml')
        job_ids = set()

        # Find all <loc> tags in the sitemap
        for loc in soup.find_all('loc'):
            url = loc.text.strip()
            match = self.job_id_pattern.search(url)
            if match:
                job_id = int(match.group(1))
                job_ids.add(job_id)

        logger.info(f"Found {len(job_ids)} job IDs in sitemap")
        return job_ids

    async def get_all_job_ids(self) -> List[int]:
        """Fetch sitemap and return all job IDs."""
        try:
            xml_content = await self.fetch_sitemap()
            job_ids = self.parse_job_ids(xml_content)
            return sorted(list(job_ids), reverse=True)  # Newest first (higher IDs)
        except Exception as e:
            logger.error(f"Failed to parse sitemap: {e}")
            raise
