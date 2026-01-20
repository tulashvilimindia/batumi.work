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
    - "ხელფასი: 1500"

    Args:
        text: Text containing salary information

    Returns:
        Tuple of (min_salary, max_salary, currency)
    """
    if not text:
        return None, None, "GEL"

    # Salary-related keywords (Georgian and English)
    salary_keywords = [
        r'ხელფასი', r'salary', r'ანაზღაურება', r'compensation',
        r'გასამრჯელო', r'pay', r'wage', r'income',
        r'GEL', r'ლარი', r'\$', r'USD', r'€', r'EUR',
    ]

    # Build pattern to find salary context
    # Look for numbers near salary keywords
    salary_pattern = (
        r'(?:' + '|'.join(salary_keywords) + r')'
        r'[:\s]*'
        r'(\d{1,3}(?:[,\s]?\d{3})*)'  # First number (with optional thousands separator)
        r'(?:\s*[-–—]\s*(\d{1,3}(?:[,\s]?\d{3})*))?'  # Optional second number (range)
    )

    # Also try reverse pattern: number followed by currency
    reverse_pattern = (
        r'(\d{1,3}(?:[,\s]?\d{3})*)'
        r'(?:\s*[-–—]\s*(\d{1,3}(?:[,\s]?\d{3})*))?'
        r'\s*(?:GEL|ლარი|\$|USD|€|EUR)'
    )

    # Detect currency first
    currency = "GEL"
    if "$" in text or "USD" in text.upper():
        currency = "USD"
    elif "€" in text or "EUR" in text.upper():
        currency = "EUR"

    # Try to find salary with context
    text_lower = text.lower()

    # Try salary keyword pattern first
    match = re.search(salary_pattern, text_lower, re.IGNORECASE)
    if match:
        num1 = int(match.group(1).replace(",", "").replace(" ", ""))
        num2 = int(match.group(2).replace(",", "").replace(" ", "")) if match.group(2) else num1

        # Validate reasonable salary range (50 to 100,000)
        if 50 <= num1 <= 100000 and 50 <= num2 <= 100000:
            return min(num1, num2), max(num1, num2), currency

    # Try reverse pattern (number + currency)
    match = re.search(reverse_pattern, text, re.IGNORECASE)
    if match:
        num1 = int(match.group(1).replace(",", "").replace(" ", ""))
        num2 = int(match.group(2).replace(",", "").replace(" ", "")) if match.group(2) else num1

        # Validate reasonable salary range
        if 50 <= num1 <= 100000 and 50 <= num2 <= 100000:
            return min(num1, num2), max(num1, num2), currency

    # Fallback: look for standalone salary-like numbers (3-5 digits, reasonable range)
    # But only if near a salary keyword
    for keyword in ['ხელფასი', 'salary', 'ანაზღაურება', 'gel', 'ლარი']:
        if keyword in text_lower:
            # Find numbers near this keyword (within 50 chars)
            keyword_pos = text_lower.find(keyword)
            context = text[max(0, keyword_pos - 30):keyword_pos + len(keyword) + 30]
            numbers = re.findall(r'\b(\d{3,5})\b', context)
            valid_numbers = [int(n) for n in numbers if 100 <= int(n) <= 50000]
            if valid_numbers:
                if len(valid_numbers) == 1:
                    return valid_numbers[0], valid_numbers[0], currency
                else:
                    return min(valid_numbers[:2]), max(valid_numbers[:2]), currency

    return None, None, currency


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

    Uses a scoring system - title matches are weighted higher than body matches.
    Multi-word phrases are checked first to avoid partial matches.
    Returns the category with highest score, or "other" if no confident match.

    Args:
        title: Job title
        body: Job body

    Returns:
        Category slug (never None - returns "other" as fallback)
    """
    title_lower = title.lower() if title else ""
    body_lower = body.lower() if body else ""
    combined = title_lower + " " + body_lower

    # Multi-word phrases to check first (order matters - check before single words)
    # These phrases help disambiguate (e.g., "sales consultant" should be sales, not customer-service)
    phrase_categories = {
        "it-programming": [
            # IT Support/Engineer phrases - MUST come before customer-service
            "it support", "it specialist", "it engineer", "it manager", "it admin",
            "it სპეციალისტ", "it ინჟინერ", "it მხარდაჭერ", "it ადმინისტრატორ",
            "it ქსელ",  # IT network
            # Software/Dev phrases
            "software engineer", "software developer", "web developer", "ვებ დეველოპერი",
            "frontend developer", "backend developer", "fullstack developer", "full-stack developer",
            "mobile developer", "ios developer", "android developer",
            "data scientist", "data engineer", "data analyst",
            "qa engineer", "devops engineer", "system administrator", "სისტემური ადმინისტრატორ",
            "network engineer", "ml engineer", "ai engineer", "ai/ml",
            "java developer", "python developer", "php developer", ".net developer",
            "c# developer", "c++ developer", "ruby developer", "golang developer",
            # Cloud/DevOps
            "cloud engineer", "cloud architect", "devops", "სერვერ ადმინისტრატორ",
        ],
        "sales-marketing": [
            "გაყიდვების კონსულტანტი", "გაყიდვების მენეჯერი", "გაყიდვების წარმომადგენელი",
            "გაყიდვების სპეციალისტ",
            "sales consultant", "sales manager", "sales representative", "sales specialist",
            "მარკეტინგის მენეჯერი", "marketing manager", "digital marketing",
            "brand manager", "pr manager", "smm manager", "seo specialist",
        ],
        "customer-service": [
            # Note: "support" alone is ambiguous - IT support should go to IT
            "customer service", "მომხმარებელთა მომსახურება", "მომხმარებელთა მხარდაჭერა",
            "call center", "ქოლ ცენტრი",
            "კლიენტთა მომსახურება",
        ],
        "hr-admin": [
            "hr manager", "hr specialist", "ადამიანური რესურსები",
            "office manager", "ოფის მენეჯერი",
        ],
    }

    # Category keywords mapping - single words and short terms
    categories = {
        "it-programming": [
            "developer", "programmer", "პროგრამისტი", "დეველოპერი",
            "python", "javascript", "react", "node.js", "nodejs", "angular", "vue.js",
            "devops", "ტესტერი", "machine learning",
            "cybersecurity", "კიბერუსაფრთხოება",
            "kotlin", "swift", "sql", "aws", "azure", "docker", "kubernetes",
            # Additional IT terms
            "backend", "frontend", "fullstack", "api", "database",
            "linux", "windows server", "vmware", "networking",
            "გრაფიკული", "photoshop", "figma",
        ],
        "sales-marketing": [
            "გაყიდვები", "გაყიდვების", "sales",
            "მარკეტინგი", "მარკეტინგის", "marketing",
            "პიარი", "ექაუნთ მენეჯერი", "account manager",
            "merchandiser", "მერჩენდაიზერი", "სავაჭრო",
        ],
        "finance-accounting": [
            "finance", "ფინანსები", "ფინანსური", "accounting", "ბუღალტერია",
            "accountant", "ბუღალტერი", "auditor", "აუდიტორი",
            "საგადასახადო", "banker", "ბანკირი",
            "კრედიტ", "სესხ", "ფინანსური ანალიტიკოსი",
            "cashier", "მოლარე",
        ],
        "medicine-healthcare": [
            "doctor", "ექიმი", "nurse", "ექთანი", "medical", "სამედიცინო",
            "hospital", "საავადმყოფო", "clinic", "კლინიკა",
            "pharmacy", "აფთიაქი", "pharmacist", "ფარმაცევტი",
            "healthcare", "ჯანდაცვა", "dentist", "სტომატოლოგი",
            "therapist", "თერაპევტი", "surgeon", "ქირურგი",
            "psychologist", "ფსიქოლოგი", "laboratory", "ლაბორატორია",
        ],
        "education": [
            "teacher", "მასწავლებელი", "tutor", "რეპეტიტორი",
            "professor", "პროფესორი", "lecturer", "ლექტორი",
            "განათლება", "school", "სკოლა",
            "university", "უნივერსიტეტი", "trainer", "ტრენერი",
            "instructor", "ინსტრუქტორი", "coach", "მწვრთნელი",
        ],
        "tourism-hospitality": [
            "hotel", "სასტუმრო", "restaurant", "რესტორანი",
            "tourism", "ტურიზმი", "travel", "მოგზაურობა",
            "chef", "მზარეული", "cook",
            "waiter", "მიმტანი", "bartender", "ბარმენი",
            "receptionist", "რეცეფციონისტი", "housekeeping",
            "კაფე", "cafe", "ბარი",
        ],
        "construction": [
            "construction", "მშენებლობა", "builder", "მშენებელი",
            "architect", "არქიტექტორი", "civil engineer", "სამოქალაქო ინჟინერი",
            "electrician", "ელექტრიკოსი", "plumber", "სანტექნიკ",
            "hvac", "კონდიციონერ", "welder", "შემდუღებელი",
            "carpenter", "დურგალი",
        ],
        "logistics-transport": [
            "driver", "მძღოლი", "logistics", "ლოჯისტიკა",
            "transport", "ტრანსპორტი", "delivery", "მიტანა",
            "courier", "კურიერი", "warehouse", "საწყობი",
            "forklift", "შტაბელერი", "dispatcher", "დისპეტჩერი",
            "expeditor", "ექსპედიტორი",
        ],
        "customer-service": [
            "operator", "ოპერატორი",
            # Note: "კონსულტანტი" removed - too generic, causes false positives
        ],
        "hr-admin": [
            "recruiter", "რეკრუტერი",
            "secretary", "მდივანი", "assistant", "ასისტენტი",
            "administrator", "ადმინისტრატორი",
        ],
        "legal": [
            "lawyer", "იურისტი", "attorney", "ადვოკატი",
            "legal", "იურიდიული", "notary", "ნოტარიუსი",
            "paralegal", "სამართლებრივი",
        ],
        "design-creative": [
            "designer", "დიზაინერი", "graphic designer", "გრაფიკული დიზაინერი",
            "ui/ux", "ux designer", "ui designer",
            "creative", "კრეატიული", "art director",
            "photographer", "ფოტოგრაფი", "videographer", "ვიდეოგრაფი",
            "animator", "ანიმატორი", "illustrator", "ილუსტრატორი",
        ],
        "media-journalism": [
            "journalist", "ჟურნალისტი", "editor", "რედაქტორი",
            "reporter", "რეპორტერი", "copywriter", "კოპირაიტერი",
            "content writer", "კონტენტ მენეჯერი", "media", "მედია",
            "tv", "ტელე", "radio", "რადიო",
        ],
        "agriculture": [
            "agriculture", "სოფლის მეურნეობა", "farming", "ფერმა",
            "agronomist", "აგრონომი", "farmer", "ფერმერი",
            "veterinary", "ვეტერინარ", "gardener", "მებაღე",
        ],
        "manufacturing": [
            "manufacturing", "წარმოება", "production", "პროდუქცია",
            "factory", "ქარხანა", "operator", "machine operator",
            "quality control", "ხარისხის კონტროლი",
            "assembly", "აწყობა", "packaging", "შეფუთვა",
        ],
        "security": [
            "security", "დაცვა", "guard", "მცველი",
            "უსაფრთხოება", "security officer", "დაცვის თანამშრომელი",
        ],
        "cleaning": [
            "cleaner", "დამლაგებელი", "cleaning", "დასუფთავება",
            "housekeeper", "housemaid", "janitor",
        ],
    }

    scores = {}

    # First pass: check multi-word phrases (higher priority)
    for category_slug, phrases in phrase_categories.items():
        score = scores.get(category_slug, 0)
        for phrase in phrases:
            if phrase in title_lower:
                score += 5  # Phrase in title = very confident
            elif phrase in body_lower:
                score += 2  # Phrase in body = moderately confident
        if score > 0:
            scores[category_slug] = score

    # Second pass: check single keywords
    for category_slug, keywords in categories.items():
        score = scores.get(category_slug, 0)
        for keyword in keywords:
            if keyword in title_lower:
                score += 3  # Word in title
            elif keyword in body_lower:
                score += 1  # Word in body
        if score > 0:
            scores[category_slug] = score

    if not scores:
        return "other"

    # Get category with highest score
    best_category = max(scores, key=scores.get)
    best_score = scores[best_category]

    # Require minimum score of 3 for confidence
    # (one title keyword match, or phrase in body + something, etc.)
    if best_score < 3:
        return "other"

    return best_category
