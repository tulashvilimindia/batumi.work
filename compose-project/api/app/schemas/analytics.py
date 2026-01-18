"""Analytics schemas for API requests and responses."""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field
from uuid import UUID


# --- Track Event Schemas ---

class TrackEventRequest(BaseModel):
    """Schema for tracking events from frontend."""
    event: str = Field(..., description="Event type (page_view, job_view, search, job_click)")
    session_id: Optional[str] = None
    job_id: Optional[UUID] = None
    query: Optional[str] = None
    filters: Optional[dict] = None
    results_count: Optional[int] = None
    position: Optional[int] = None
    language: Optional[str] = None
    referrer: Optional[str] = None
    timestamp: Optional[datetime] = None


# --- Dashboard Response Schemas ---

class SummaryStats(BaseModel):
    """Summary statistics for dashboard."""
    total_jobs: int
    active_jobs: int
    new_jobs_period: int
    total_views: int
    unique_visitors: int
    searches: int
    avg_jobs_per_day: float


class TrendStats(BaseModel):
    """Trend comparison statistics."""
    jobs_change_pct: float
    views_change_pct: float
    searches_change_pct: float


class CategoryStat(BaseModel):
    """Category statistics."""
    slug: str
    name: str
    jobs: int
    views: int


class RegionStat(BaseModel):
    """Region statistics."""
    slug: str
    name: str
    jobs: int
    pct: float


class SalaryInsights(BaseModel):
    """Salary insights."""
    jobs_with_salary_pct: float
    avg_salary_min: int
    avg_salary_max: int
    currency: str = "GEL"


class ParserSourceHealth(BaseModel):
    """Parser source health status."""
    name: str
    status: str  # healthy, warning, error, pending
    last_run: Optional[datetime]
    jobs_today: int


class ParserHealth(BaseModel):
    """Overall parser health."""
    sources: List[ParserSourceHealth]
    success_rate_24h: float


class DashboardResponse(BaseModel):
    """Main dashboard response."""
    period: dict
    summary: SummaryStats
    trends: TrendStats
    top_categories: List[CategoryStat]
    top_regions: List[RegionStat]
    salary_insights: SalaryInsights
    parser_health: ParserHealth


# --- Job Market Analytics Schemas ---

class DateCount(BaseModel):
    """Date with count."""
    date: date
    count: int


class JobFlowStats(BaseModel):
    """Job flow statistics."""
    created: List[DateCount]
    expired: List[DateCount]
    net_change: List[DateCount]


class CategoryAnalytics(BaseModel):
    """Category analytics."""
    category: str
    total: int
    new_period: int
    avg_salary: dict
    salary_coverage_pct: float
    top_companies: List[str]


class EmploymentTypeStats(BaseModel):
    """Employment type statistics."""
    full_time: int
    part_time: int
    contract: int
    internship: int


class SalaryRange(BaseModel):
    """Salary range count."""
    range: str
    count: int


class SalaryDistribution(BaseModel):
    """Salary distribution."""
    ranges: List[SalaryRange]
    currency: str = "GEL"


class CompanyRanking(BaseModel):
    """Company ranking."""
    name: str
    active_jobs: int
    total_views: int


class JobMarketResponse(BaseModel):
    """Job market analytics response."""
    period: dict
    job_flow: JobFlowStats
    by_category: List[CategoryAnalytics]
    by_employment_type: EmploymentTypeStats
    salary_distribution: SalaryDistribution
    companies_ranking: List[CompanyRanking]


# --- Search Analytics Schemas ---

class SearchQuery(BaseModel):
    """Search query statistics."""
    query: str
    count: int
    avg_results: float
    click_rate: float


class SearchAnalyticsResponse(BaseModel):
    """Search analytics response."""
    period: dict
    total_searches: int
    unique_sessions: int
    avg_results_per_search: float
    searches_with_results_pct: float
    top_queries: List[SearchQuery]
    zero_result_queries: List[str]


# --- Views Analytics Schemas ---

class ViewsAnalyticsResponse(BaseModel):
    """Views analytics response."""
    period: dict
    total_views: int
    unique_visitors: int
    views_by_day: List[DateCount]
    device_breakdown: dict
    top_viewed_jobs: List[dict]
    traffic_sources: List[dict]
