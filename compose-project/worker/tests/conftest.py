"""Pytest configuration and fixtures for parser tests."""
import pytest
from typing import Generator


# Sample HTML fixtures
@pytest.fixture
def mock_jobs_ge_list_html() -> str:
    """Sample jobs.ge list page HTML."""
    return """
    <!DOCTYPE html>
    <html>
    <head><title>Jobs.ge - ვაკანსიები</title></head>
    <body>
        <table>
            <tr>
                <td>
                    <a href="/ge/?view=jobs&id=12345">პროგრამისტი / Developer</a>
                    <a href="/ge/?view=client&id=100">TechCorp</a>
                </td>
            </tr>
            <tr class="vip">
                <td>
                    <a href="/ge/?view=jobs&id=67890">მარკეტინგის მენეჯერი</a>
                    <a href="/ge/?view=client&id=101">Marketing Plus</a>
                </td>
            </tr>
            <tr>
                <td>
                    <a href="/ge/?view=jobs&id=11111">ბუღალტერი</a>
                    <a href="/ge/?view=client&id=102">Finance Co</a>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


@pytest.fixture
def mock_jobs_ge_detail_html() -> str:
    """Sample jobs.ge detail page HTML."""
    return """
    <!DOCTYPE html>
    <html>
    <head><title>პროგრამისტი / Developer | Jobs.ge</title></head>
    <body>
        <h1>პროგრამისტი / Developer</h1>
        <div class="company">
            <a href="/ge/?view=client&id=100">TechCorp</a>
        </div>
        <table>
            <tr>
                <td>ადგილმდებარეობა:</td>
                <td>თბილისი</td>
            </tr>
            <tr>
                <td>ხელფასი:</td>
                <td>3000 - 5000 GEL</td>
            </tr>
        </table>
        <div class="description">
            <p>ვეძებთ გამოცდილ პროგრამისტს Python-ში.</p>
            <p>მოთხოვნები:</p>
            <ul>
                <li>3+ წლის გამოცდილება</li>
                <li>Python, FastAPI</li>
                <li>PostgreSQL</li>
            </ul>
            <p>გამოქვეყნდა: 15.01.2026</p>
            <p>ბოლო ვადა: 30.01.2026</p>
        </div>
    </body>
    </html>
    """


@pytest.fixture
def mock_jobs_ge_detail_no_salary_html() -> str:
    """Sample jobs.ge detail page HTML without salary."""
    return """
    <!DOCTYPE html>
    <html>
    <head><title>დიზაინერი | Jobs.ge</title></head>
    <body>
        <h1>გრაფიკული დიზაინერი</h1>
        <div class="company">
            <a href="/ge/?view=client&id=105">DesignStudio</a>
        </div>
        <div class="description">
            <p>ვეძებთ კრეატიულ დიზაინერს.</p>
            <p>გამოცდილება: 2+ წელი</p>
            <p>ხელფასი: შეთანხმებით</p>
        </div>
    </body>
    </html>
    """


@pytest.fixture
def mock_hr_ge_list_html() -> str:
    """Sample hr.ge list page HTML."""
    return """
    <!DOCTYPE html>
    <html>
    <head><title>HR.ge - ვაკანსიები</title></head>
    <body>
        <div class="vacancy-list">
            <div class="vacancy-item" data-id="v123">
                <a href="/vacancy/v123" class="vacancy-title">Senior Developer</a>
                <span class="company">BigTech Ltd</span>
                <span class="location">Batumi</span>
            </div>
            <div class="vacancy-item premium" data-id="v456">
                <a href="/vacancy/v456" class="vacancy-title">Project Manager</a>
                <span class="company">PM Solutions</span>
                <span class="location">Tbilisi</span>
            </div>
        </div>
    </body>
    </html>
    """


@pytest.fixture
def mock_hr_ge_detail_html() -> str:
    """Sample hr.ge detail page HTML."""
    return """
    <!DOCTYPE html>
    <html>
    <head><title>Senior Developer - HR.ge</title></head>
    <body>
        <div class="vacancy-detail">
            <h1 class="vacancy-title">Senior Developer</h1>
            <div class="company-name">BigTech Ltd</div>
            <div class="vacancy-info">
                <span class="location">Batumi</span>
                <span class="salary">4000-6000 USD</span>
                <span class="date">Posted: 2026-01-10</span>
            </div>
            <div class="vacancy-description">
                <p>We are looking for an experienced Senior Developer to join our team.</p>
                <h3>Requirements:</h3>
                <ul>
                    <li>5+ years of experience</li>
                    <li>Strong Python skills</li>
                    <li>Experience with microservices</li>
                </ul>
                <h3>We offer:</h3>
                <ul>
                    <li>Competitive salary</li>
                    <li>Remote work options</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
    """
