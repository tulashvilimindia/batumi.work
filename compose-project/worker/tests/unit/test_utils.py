"""Unit tests for parsing utilities."""
import pytest
from datetime import datetime
from app.core.utils import (
    compute_content_hash,
    normalize_text,
    extract_salary,
    extract_date,
    clean_html,
    detect_language,
    classify_category,
)


class TestContentHash:
    """Tests for content hash computation."""

    def test_compute_hash_basic(self):
        """Test basic hash computation."""
        hash1 = compute_content_hash("Title", "Body text")
        assert hash1 is not None
        assert len(hash1) == 64  # SHA-256 hex length

    def test_compute_hash_with_company(self):
        """Test hash computation with company name."""
        hash1 = compute_content_hash("Title", "Body", "Company A")
        hash2 = compute_content_hash("Title", "Body", "Company B")
        assert hash1 != hash2

    def test_compute_hash_deterministic(self):
        """Test that hash is deterministic."""
        hash1 = compute_content_hash("Same Title", "Same Body")
        hash2 = compute_content_hash("Same Title", "Same Body")
        assert hash1 == hash2

    def test_compute_hash_normalized(self):
        """Test that hash normalizes text."""
        hash1 = compute_content_hash("TITLE", "body")
        hash2 = compute_content_hash("title", "BODY")
        assert hash1 == hash2


class TestNormalizeText:
    """Tests for text normalization."""

    def test_normalize_whitespace(self):
        """Test whitespace normalization."""
        result = normalize_text("text   with    spaces")
        assert "  " not in result

    def test_normalize_lowercase(self):
        """Test lowercase conversion."""
        result = normalize_text("UPPERCASE TEXT")
        assert result == normalize_text("uppercase text")

    def test_normalize_html_removal(self):
        """Test HTML tag removal."""
        result = normalize_text("<p>Some <b>text</b></p>")
        assert "<" not in result
        assert ">" not in result
        assert "text" in result

    def test_normalize_empty(self):
        """Test empty string handling."""
        assert normalize_text("") == ""
        assert normalize_text(None) == ""

    def test_normalize_georgian(self):
        """Test Georgian text preservation."""
        result = normalize_text("ტესტი")
        assert "ტესტი" in result


class TestExtractSalary:
    """Tests for salary extraction."""

    def test_extract_salary_gel_range(self):
        """Test extracting GEL salary range."""
        min_sal, max_sal, currency = extract_salary("2000-3000 GEL")
        assert min_sal == 2000
        assert max_sal == 3000
        assert currency == "GEL"

    def test_extract_salary_usd(self):
        """Test extracting USD salary."""
        min_sal, max_sal, currency = extract_salary("$2500")
        assert min_sal == 2500
        assert currency == "USD"

    def test_extract_salary_eur(self):
        """Test extracting EUR salary."""
        min_sal, max_sal, currency = extract_salary("1500€")
        assert min_sal == 1500
        assert currency == "EUR"

    def test_extract_salary_with_commas(self):
        """Test extracting salary with comma separators."""
        min_sal, max_sal, currency = extract_salary("2,000 - 3,500 GEL")
        assert min_sal == 2000
        assert max_sal == 3500

    def test_extract_salary_single_value(self):
        """Test extracting single salary value."""
        min_sal, max_sal, currency = extract_salary("1500 GEL")
        assert min_sal == 1500
        assert max_sal == 1500

    def test_extract_salary_empty(self):
        """Test empty string handling."""
        min_sal, max_sal, currency = extract_salary("")
        assert min_sal is None
        assert max_sal is None

    def test_extract_salary_no_salary(self):
        """Test text without salary."""
        min_sal, max_sal, currency = extract_salary("შეთანხმებით")
        assert min_sal is None


class TestExtractDate:
    """Tests for date extraction."""

    def test_extract_date_iso(self):
        """Test ISO date format extraction."""
        result = extract_date("2024-01-15")
        assert result is not None
        assert result.year == 2024
        assert result.month == 1
        assert result.day == 15

    def test_extract_date_dot_format(self):
        """Test DD.MM.YYYY format extraction."""
        result = extract_date("15.01.2024")
        assert result is not None
        assert result.year == 2024
        assert result.month == 1
        assert result.day == 15

    def test_extract_date_georgian(self):
        """Test Georgian date format extraction."""
        result = extract_date("23 იანვარი 2024")
        assert result is not None
        assert result.year == 2024
        assert result.month == 1
        assert result.day == 23

    def test_extract_date_english(self):
        """Test English date format extraction."""
        result = extract_date("January 15, 2024")
        assert result is not None
        assert result.year == 2024
        assert result.month == 1
        assert result.day == 15

    def test_extract_date_empty(self):
        """Test empty string handling."""
        assert extract_date("") is None
        assert extract_date(None) is None

    def test_extract_date_invalid(self):
        """Test invalid date handling."""
        assert extract_date("no date here") is None


class TestCleanHtml:
    """Tests for HTML cleaning."""

    def test_clean_html_basic(self):
        """Test basic HTML cleaning."""
        html = "<p>Hello <b>World</b></p>"
        result = clean_html(html)
        assert "Hello" in result
        assert "World" in result
        assert "<p>" not in result
        assert "<b>" not in result

    def test_clean_html_removes_scripts(self):
        """Test script tag removal."""
        html = "<script>alert('hi')</script><p>Content</p>"
        result = clean_html(html)
        assert "alert" not in result
        assert "Content" in result

    def test_clean_html_removes_styles(self):
        """Test style tag removal."""
        html = "<style>.class{color:red}</style><p>Content</p>"
        result = clean_html(html)
        assert "color" not in result
        assert "Content" in result

    def test_clean_html_preserves_structure(self):
        """Test that paragraph structure is preserved."""
        html = "<p>Paragraph 1</p><p>Paragraph 2</p>"
        result = clean_html(html)
        assert "Paragraph 1" in result
        assert "Paragraph 2" in result


class TestDetectLanguage:
    """Tests for language detection."""

    def test_detect_georgian(self):
        """Test Georgian language detection."""
        assert detect_language("ეს არის ქართული ტექსტი") == "ge"

    def test_detect_english(self):
        """Test English language detection."""
        assert detect_language("This is English text") == "en"

    def test_detect_mixed_mostly_georgian(self):
        """Test mixed text with majority Georgian."""
        assert detect_language("ეს არის Python პროგრამისტი") == "ge"

    def test_detect_mixed_mostly_english(self):
        """Test mixed text with majority English."""
        assert detect_language("This is a test with some ტექსტი") == "en"

    def test_detect_empty(self):
        """Test empty string handling."""
        assert detect_language("") == "en"
        assert detect_language(None) == "en"


class TestClassifyCategory:
    """Tests for job category classification."""

    def test_classify_it(self):
        """Test IT category classification."""
        assert classify_category("Python Developer", "Looking for a programmer") == "it-programming"
        assert classify_category("პროგრამისტი", "Python გამოცდილებით") == "it-programming"
        assert classify_category("Software Engineer", "Building web applications") == "it-programming"

    def test_classify_sales(self):
        """Test sales category classification."""
        assert classify_category("Sales Manager", "Marketing experience required") == "sales-marketing"
        # Critical test: "Sales Consultant" should be sales, NOT customer-service
        assert classify_category("გაყიდვების კონსულტანტი", "მაღაზიაში მუშაობა") == "sales-marketing"
        assert classify_category("Sales Consultant", "Retail position") == "sales-marketing"

    def test_classify_finance(self):
        """Test finance category classification."""
        assert classify_category("ბუღალტერი", "ფინანსური აღრიცხვა") == "finance-accounting"
        assert classify_category("Accountant", "Financial reporting experience") == "finance-accounting"

    def test_classify_healthcare(self):
        """Test healthcare category classification."""
        assert classify_category("Doctor", "Hospital position needed") == "medicine-healthcare"
        assert classify_category("ექიმი", "კლინიკა") == "medicine-healthcare"

    def test_classify_education(self):
        """Test education category classification."""
        assert classify_category("მასწავლებელი", "სკოლაში სწავლება") == "education"
        assert classify_category("Teacher", "School position") == "education"

    def test_classify_tourism(self):
        """Test tourism category classification."""
        assert classify_category("Hotel Receptionist", "სასტუმრო") == "tourism-hospitality"
        assert classify_category("მიმტანი", "რესტორანი") == "tourism-hospitality"

    def test_classify_construction(self):
        """Test construction category classification."""
        assert classify_category("მშენებელი", "მშენებლობის გამოცდილება") == "construction"
        assert classify_category("Architect", "Construction project") == "construction"

    def test_classify_logistics(self):
        """Test logistics category classification."""
        assert classify_category("მძღოლი", "ტრანსპორტი და ლოჯისტიკა") == "logistics-transport"
        assert classify_category("Driver", "Delivery service") == "logistics-transport"

    def test_classify_customer_service(self):
        """Test customer service category classification."""
        assert classify_category("Call Center Operator", "ქოლ ცენტრი") == "customer-service"
        assert classify_category("Customer Service Representative", "მომხმარებელთა მომსახურება") == "customer-service"

    def test_classify_hr_admin(self):
        """Test HR/Administration category classification."""
        assert classify_category("მდივანი", "ოფისის მენეჯერი") == "hr-admin"
        assert classify_category("HR Manager", "Recruitment and hiring") == "hr-admin"
        assert classify_category("Recruiter", "Talent acquisition") == "hr-admin"

    def test_classify_legal(self):
        """Test legal category classification."""
        assert classify_category("იურისტი", "იურიდიული კონსულტაცია") == "legal"
        assert classify_category("Lawyer", "Legal services") == "legal"

    def test_classify_design(self):
        """Test design category classification."""
        assert classify_category("Graphic Designer", "Creative work") == "design-creative"
        assert classify_category("დიზაინერი", "UI/UX დიზაინი") == "design-creative"

    def test_classify_unknown_returns_other(self):
        """Test unknown category returns 'other' (not None)."""
        assert classify_category("Random Job", "No keywords here") == "other"
        assert classify_category("", "") == "other"

    def test_classify_requires_minimum_confidence(self):
        """Test that weak matches return 'other'."""
        # Single weak keyword in body should not be enough
        assert classify_category("General Position", "some random text") == "other"
