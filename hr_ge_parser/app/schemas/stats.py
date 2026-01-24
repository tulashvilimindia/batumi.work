from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class LocationStats(BaseModel):
    location: str
    count: int


class IndustryStats(BaseModel):
    industry: str
    count: int


class SalaryStats(BaseModel):
    avg_salary_from: Optional[float] = None
    avg_salary_to: Optional[float] = None
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    jobs_with_salary: int


class StatsResponse(BaseModel):
    total_jobs: int
    active_jobs: int
    expired_jobs: int
    total_companies: int
    remote_jobs: int
    student_jobs: int
    jobs_with_salary: int
    last_updated: Optional[datetime] = None


class ParserRunResponse(BaseModel):
    id: int
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    status: str
    jobs_found: int
    jobs_created: int
    jobs_updated: int
    jobs_failed: int
    error_message: Optional[str] = None
    run_type: str


class ParserStatusResponse(BaseModel):
    scheduler_running: bool
    next_run_time: Optional[str] = None
    interval_hours: int
    last_run: Optional[ParserRunResponse] = None
