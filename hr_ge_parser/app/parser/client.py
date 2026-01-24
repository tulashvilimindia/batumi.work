import asyncio
import logging
from typing import Optional, Dict, Any, List
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class HRGeClient:
    """HTTP client for HR.GE API with rate limiting and retry logic."""

    def __init__(self):
        self.base_url = settings.hr_ge_api_base
        self.rate_limit = settings.parser_rate_limit
        self.last_request_time = 0
        self._lock = asyncio.Lock()

    async def _rate_limit_wait(self):
        """Enforce rate limiting between requests."""
        async with self._lock:
            current_time = asyncio.get_event_loop().time()
            time_since_last = current_time - self.last_request_time
            if time_since_last < self.rate_limit:
                await asyncio.sleep(self.rate_limit - time_since_last)
            self.last_request_time = asyncio.get_event_loop().time()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    )
    async def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Make an HTTP request with retry logic."""
        await self._rate_limit_wait()

        url = f"{self.base_url}{endpoint}"
        logger.debug(f"Making request to {url}")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(method, url, params=params, **kwargs)
            response.raise_for_status()
            return response.json()

    async def get_job(self, job_id: int) -> Optional[Dict[str, Any]]:
        """Fetch a single job by ID from the API."""
        try:
            data = await self._request("GET", f"/announcement/{job_id}")
            # API returns data wrapped in data.announcement
            if isinstance(data, dict) and "data" in data:
                return data["data"].get("announcement")
            return data
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning(f"Job {job_id} not found")
                return None
            raise

    async def get_jobs_list(
        self,
        page: int = 1,
        per_page: int = 20,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Fetch jobs list with pagination."""
        params = {
            "page": page,
            "per_page": per_page,
        }
        if filters:
            params.update(filters)

        return await self._request("GET", "/announcements", params=params)

    async def get_company(self, company_id: int) -> Optional[Dict[str, Any]]:
        """Fetch a company by ID."""
        try:
            data = await self._request("GET", f"/customers/{company_id}")
            return data
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning(f"Company {company_id} not found")
                return None
            raise

    async def get_industries(self) -> List[Dict[str, Any]]:
        """Fetch all industries."""
        try:
            data = await self._request("GET", "/industries")
            return data if isinstance(data, list) else data.get("data", [])
        except Exception as e:
            logger.error(f"Failed to fetch industries: {e}")
            return []

    async def get_locations(self) -> List[Dict[str, Any]]:
        """Fetch all locations."""
        try:
            data = await self._request("GET", "/locations")
            return data if isinstance(data, list) else data.get("data", [])
        except Exception as e:
            logger.error(f"Failed to fetch locations: {e}")
            return []

    async def get_specializations(self) -> List[Dict[str, Any]]:
        """Fetch all specializations."""
        try:
            data = await self._request("GET", "/specializations")
            return data if isinstance(data, list) else data.get("data", [])
        except Exception as e:
            logger.error(f"Failed to fetch specializations: {e}")
            return []
