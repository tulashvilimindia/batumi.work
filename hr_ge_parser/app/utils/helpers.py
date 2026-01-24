import re
from datetime import datetime
from typing import Optional
from bs4 import BeautifulSoup


def parse_datetime(date_str: Optional[str]) -> Optional[datetime]:
    """Parse datetime string from various formats."""
    if not date_str:
        return None

    formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue

    return None


def clean_html(html_content: Optional[str]) -> Optional[str]:
    """Remove HTML tags and clean up text content."""
    if not html_content:
        return None

    soup = BeautifulSoup(html_content, "html.parser")
    text = soup.get_text(separator=" ")

    # Clean up whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


def truncate_string(text: Optional[str], max_length: int = 500) -> Optional[str]:
    """Truncate string to max length."""
    if not text:
        return None

    if len(text) <= max_length:
        return text

    return text[: max_length - 3] + "..."
