"""HTTP client with retry logic and rate limiting."""
import asyncio
import random
from typing import Optional, Dict, Any
import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)


class HTTPClientError(Exception):
    """Base exception for HTTP client errors."""

    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class HTTPClient:
    """Async HTTP client with retry logic, rate limiting, and error handling."""

    DEFAULT_HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,ka;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
    }

    def __init__(
        self,
        timeout: float = 30.0,
        rate_limit_delay: float = 1.0,
        max_retries: int = 3,
        headers: Optional[Dict[str, str]] = None,
        proxy: Optional[str] = None,
    ):
        """Initialize HTTP client.

        Args:
            timeout: Request timeout in seconds
            rate_limit_delay: Minimum delay between requests
            max_retries: Maximum retry attempts
            headers: Additional headers to include
            proxy: Proxy URL (optional)
        """
        self.timeout = timeout
        self.rate_limit_delay = rate_limit_delay
        self.max_retries = max_retries
        self._last_request_time = 0.0
        self._headers = {**self.DEFAULT_HEADERS, **(headers or {})}
        self._proxy = proxy
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        """Async context manager entry."""
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(self.timeout),
            follow_redirects=True,
            headers=self._headers,
            proxy=self._proxy,
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self._client:
            await self._client.aclose()
            self._client = None

    async def _rate_limit(self):
        """Apply rate limiting between requests."""
        current_time = asyncio.get_event_loop().time()
        elapsed = current_time - self._last_request_time
        if elapsed < self.rate_limit_delay:
            # Add small random jitter to avoid patterns
            jitter = random.uniform(0.1, 0.3)
            await asyncio.sleep(self.rate_limit_delay - elapsed + jitter)
        self._last_request_time = asyncio.get_event_loop().time()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError)),
    )
    async def get(
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> httpx.Response:
        """Make a GET request with retry logic.

        Args:
            url: URL to request
            params: Query parameters
            headers: Additional headers

        Returns:
            HTTP response

        Raises:
            HTTPClientError: On HTTP errors
        """
        if not self._client:
            raise RuntimeError("HTTPClient must be used as async context manager")

        await self._rate_limit()

        try:
            response = await self._client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response
        except httpx.HTTPStatusError as e:
            raise HTTPClientError(
                f"HTTP error {e.response.status_code}: {e.response.text[:200]}",
                status_code=e.response.status_code,
            ) from e
        except httpx.RequestError as e:
            raise HTTPClientError(f"Request error: {str(e)}") from e

    async def get_text(
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None,
        encoding: str = "utf-8",
    ) -> str:
        """Get response as text.

        Args:
            url: URL to request
            params: Query parameters
            encoding: Text encoding

        Returns:
            Response text
        """
        response = await self.get(url, params=params)
        response.encoding = encoding
        return response.text

    async def get_json(
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> Any:
        """Get response as JSON.

        Args:
            url: URL to request
            params: Query parameters

        Returns:
            Parsed JSON response
        """
        response = await self.get(url, params=params)
        return response.json()


class ProxyRotator:
    """Rotate through a list of proxies."""

    def __init__(self, proxies: list[str]):
        """Initialize with list of proxy URLs.

        Args:
            proxies: List of proxy URLs (e.g., ["http://proxy1:8080", "socks5://proxy2:1080"])
        """
        self._proxies = proxies
        self._index = 0
        self._failed: set[str] = set()

    def get_next(self) -> Optional[str]:
        """Get next available proxy.

        Returns:
            Proxy URL or None if all proxies failed
        """
        if not self._proxies:
            return None

        available = [p for p in self._proxies if p not in self._failed]
        if not available:
            # Reset failed proxies and try again
            self._failed.clear()
            available = self._proxies

        self._index = (self._index + 1) % len(available)
        return available[self._index]

    def mark_failed(self, proxy: str):
        """Mark a proxy as failed.

        Args:
            proxy: Proxy URL that failed
        """
        self._failed.add(proxy)

    def reset(self):
        """Reset failed proxies list."""
        self._failed.clear()
