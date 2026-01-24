from fastapi import APIRouter
from app.api import jobs, companies, stats, parser

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(stats.router, prefix="/stats", tags=["Statistics"])
api_router.include_router(parser.router, prefix="/parser", tags=["Parser"])
