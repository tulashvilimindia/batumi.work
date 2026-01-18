"""Parsing utilities for content processing."""
import hashlib
import re
from datetime import datetime
from typing import Optional, Tuple
from bs4 import BeautifulSoup


def compute_content_hash(
    title: str,
    body: str,
    company: Optional[str] = None,
) -> str:
    """Compute SHA-256 hash of job content for change detection.

    Args:
        title: Job title
        body: Job body/description
        company: Company name (optional)

    Returns:
        SHA-256 hex digest
    """
    content = normalize_text(title) + normalize_text(body)
    if company:
        content += normalize_text(company)
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def normalize_text(text: Optional[str]) -> str:
    """Normalize text for comparison and hashing.

    - Removes extra whitespace
    - Converts to lowercase
    - Removes special characters (keeps alphanumeric and Georgian)

    Args:
        text: Text to normalize

    Returns:
        Normalized text
    """
    if not text:
        return ""

    # Convert to lowercase
    text = text.lower()

    # Remove HTML tags if any
    text = BeautifulSoup(text, "html.parser").get_text()

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Keep alphanumeric, Georgian characters, and spaces
    text = re.sub(r"[^\w\s\u10A0-\u10FF]", "", text)

    return text


def extract_salary(text: str) -> Tuple[Optional[int], Optional[int], str]:
    """Extract salary information from text.

    Handles various formats:
    - "2000 GEL"
    - "2000-3000 GEL"
    - "2,000 - 3,000 ლარი"
    - "$2000"
    - "2000-3000$"

    Args:
        text: Text containing salary information

    Returns:
        Tuple of (min_salary, max_salary, currency)
    """
    if not text:
        return None, None, "GEL"

    text = text.replace(",", "").replace(" ", "")

    # Detect currency
    currency = "GEL"
    if "$" in text or "USD" in text.upper():
        currency = "USD"
    elif "€" in text or "EUR" in text.upper():
        currency = "EUR"

    # Extract numbers
    numbers = re.findall(r"\d+", text)
    numbers = [int(n) for n in numbers if int(n) > 50]  # Filter out small numbers

    if not numbers:
        return None, None, currency

    if len(numbers) == 1:
        return numbers[0], numbers[0], currency
    else:
        return min(numbers[:2]), max(numbers[:2]), currency


def extract_date(text: str, language: str = "ge") -> Optional[datetime]:
    """Extract date from text.

    Handles formats:
    - "23 იანვარი 2024"
    - "January 23, 2024"
    - "23.01.2024"
    - "2024-01-23"

    Args:
        text: Text containing date
        language: Language code ("ge" or "en")

    Returns:
        datetime object or None
    """
    if not text:
        return None

    text = text.strip()

    # Georgian month names
    ge_months = {
        "იანვარი": 1, "თებერვალი": 2, "მარტი": 3, "აპრილი": 4,
        "მაისი": 5, "ივნისი": 6, "ივლისი": 7, "აგვისტო": 8,
        "სექტემბერი": 9, "ოქტომბერი": 10, "ნოემბერი": 11, "დეკემბერი": 12,
    }

    # English month names
    en_months = {
        "january": 1, "february": 2, "march": 3, "april": 4,
        "may": 5, "june": 6, "july": 7, "august": 8,
        "september": 9, "october": 10, "november": 11, "december": 12,
    }

    # Try ISO format (YYYY-MM-DD)
    iso_match = re.search(r"(\d{4})-(\d{1,2})-(\d{1,2})", text)
    if iso_match:
        try:
            return datetime(
                int(iso_match.group(1)),
                int(iso_match.group(2)),
                int(iso_match.group(3)),
            )
        except ValueError:
            pass

    # Try DD.MM.YYYY format
    dot_match = re.search(r"(\d{1,2})\.(\d{1,2})\.(\d{4})", text)
    if dot_match:
        try:
            return datetime(
                int(dot_match.group(3)),
                int(dot_match.group(2)),
                int(dot_match.group(1)),
            )
        except ValueError:
            pass

    # Try Georgian format (DD month YYYY)
    for month_name, month_num in ge_months.items():
        if month_name in text:
            match = re.search(rf"(\d{{1,2}})\s*{month_name}\s*(\d{{4}})", text)
            if match:
                try:
                    return datetime(
                        int(match.group(2)),
                        month_num,
                        int(match.group(1)),
                    )
                except ValueError:
                    pass

    # Try English format
    text_lower = text.lower()
    for month_name, month_num in en_months.items():
        if month_name in text_lower:
            # Try "Month DD, YYYY"
            match = re.search(rf"{month_name}\s+(\d{{1,2}}),?\s*(\d{{4}})", text_lower)
            if match:
                try:
                    return datetime(
                        int(match.group(2)),
                        month_num,
                        int(match.group(1)),
                    )
                except ValueError:
                    pass

    return None


def clean_html(html: str) -> str:
    """Clean HTML content and extract text.

    Preserves paragraph structure but removes tags.

    Args:
        html: HTML content

    Returns:
        Cleaned text
    """
    soup = BeautifulSoup(html, "html.parser")

    # Remove script and style elements
    for element in soup(["script", "style", "head", "meta", "link"]):
        element.decompose()

    # Get text with preserved structure
    text = soup.get_text(separator="\n")

    # Clean up whitespace
    lines = [line.strip() for line in text.splitlines()]
    lines = [line for line in lines if line]
    text = "\n".join(lines)

    return text


def detect_language(text: str) -> str:
    """Detect if text is Georgian or English.

    Args:
        text: Text to analyze

    Returns:
        "ge" for Georgian, "en" for English
    """
    if not text:
        return "en"

    # Count Georgian characters
    georgian_chars = len(re.findall(r"[\u10A0-\u10FF]", text))
    total_alpha = len(re.findall(r"[a-zA-Z\u10A0-\u10FF]", text))

    if total_alpha == 0:
        return "en"

    # If more than 30% Georgian characters, it's Georgian
    return "ge" if georgian_chars / total_alpha > 0.3 else "en"


def classify_category(title: str, body: str) -> Optional[str]:
    """Classify job into category based on keywords.

    Args:
        title: Job title
        body: Job body

    Returns:
        Category slug or None
    """
    text = (title + " " + body).lower()

    # Category keywords mapping
    categories = {
        "it-programming": [
            "developer", "programmer", "პროგრამისტი", "დეველოპერი",
            "software", "python", "java", "javascript", "react", "node",
            "frontend", "backend", "fullstack", "devops", "ios", "android",
            "qa", "tester", "ტესტერი", "data", "ml", "ai",
        ],
        "sales-marketing": [
            "sales", "გაყიდვები", "marketing", "მარკეტინგი",
            "seo", "smm", "digital", "brand", "pr", "პიარი",
            "manager", "მენეჯერი", "account",
        ],
        "finance-accounting": [
            "finance", "ფინანსები", "accounting", "ბუღალტერია",
            "accountant", "ბუღალტერი", "auditor", "აუდიტორი",
            "tax", "საგადასახადო", "bank", "ბანკი",
        ],
        "medicine-healthcare": [
            "doctor", "ექიმი", "nurse", "ექთანი", "medical", "სამედიცინო",
            "hospital", "საავადმყოფო", "clinic", "კლინიკა",
            "pharmacy", "აფთიაქი", "healthcare",
        ],
        "education": [
            "teacher", "მასწავლებელი", "tutor", "რეპეტიტორი",
            "professor", "პროფესორი", "education", "განათლება",
            "school", "სკოლა", "university", "უნივერსიტეტი",
        ],
        "tourism-hospitality": [
            "hotel", "სასტუმრო", "restaurant", "რესტორანი",
            "tourism", "ტურიზმი", "travel", "chef", "მზარეული",
            "waiter", "მიმტანი", "receptionist", "ადმინისტრატორი",
        ],
        "construction": [
            "construction", "მშენებლობა", "builder", "მშენებელი",
            "architect", "არქიტექტორი", "engineer", "ინჟინერი",
            "electrician", "ელექტრიკოსი", "plumber",
        ],
        "logistics-transport": [
            "driver", "მძღოლი", "logistics", "ლოჯისტიკა",
            "transport", "ტრანსპორტი", "delivery", "მიტანა",
            "courier", "კურიერი", "warehouse", "საწყობი",
        ],
        "customer-service": [
            "customer", "მომხმარებელ", "support", "მხარდაჭერა",
            "call center", "ქოლ ცენტრი", "operator", "ოპერატორი",
            "consultant", "კონსულტანტი",
        ],
        "administration": [
            "admin", "ადმინისტრატორი", "office", "ოფისი",
            "secretary", "მდივანი", "assistant", "ასისტენტი",
            "hr", "ადამიანური რესურსები", "recruiter",
        ],
    }

    for category_slug, keywords in categories.items():
        if any(keyword in text for keyword in keywords):
            return category_slug

    return None
