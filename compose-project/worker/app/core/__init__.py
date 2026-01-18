"""Core utilities for parser worker."""
from .base_adapter import BaseAdapter, JobData
from .http_client import HTTPClient
from .utils import compute_content_hash, normalize_text, extract_salary

__all__ = [
    "BaseAdapter",
    "JobData",
    "HTTPClient",
    "compute_content_hash",
    "normalize_text",
    "extract_salary",
]
