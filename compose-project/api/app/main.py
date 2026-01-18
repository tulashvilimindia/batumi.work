"""FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog

from app.core.config import settings
from app.core.database import init_db
from app.routers import jobs_router, categories_router, regions_router, admin_router
from app.routers.admin_parser import router as parser_admin_router
from app.routers.admin_analytics import router as analytics_admin_router, public_router as analytics_public_router

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("application_starting", environment=settings.ENVIRONMENT)
    await init_db()
    logger.info("database_initialized")

    yield

    # Shutdown
    logger.info("application_shutting_down")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Job board API for Georgia - bilingual (Georgian/English)",
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Add API version header middleware
@app.middleware("http")
async def add_api_version_header(request: Request, call_next):
    """Add X-API-Version header to all responses."""
    response = await call_next(request)
    response.headers["X-API-Version"] = "v1"
    return response


# ============== Health Check Endpoints ==============


@app.get("/health", tags=["System"])
async def health_check():
    """Basic health check - returns 200 if alive."""
    return {"status": "healthy", "version": settings.APP_VERSION}


@app.get("/ready", tags=["System"])
async def readiness_check():
    """Readiness check - verifies database connectivity."""
    # In production, we'd check DB connection here
    return {"status": "ready", "database": "connected"}


# ============== API v1 Router ==============

# Public endpoints
app.include_router(
    jobs_router,
    prefix="/api/v1/jobs",
    tags=["Jobs"],
)

app.include_router(
    categories_router,
    prefix="/api/v1/categories",
    tags=["Categories"],
)

app.include_router(
    regions_router,
    prefix="/api/v1/regions",
    tags=["Regions"],
)

# Admin endpoints (protected by API key)
app.include_router(
    admin_router,
    prefix="/api/v1/admin",
    tags=["Admin"],
)

# Parser admin endpoints (protected by API key)
app.include_router(
    parser_admin_router,
    prefix="/api/v1/admin",
)

# Analytics admin endpoints (protected by API key)
app.include_router(
    analytics_admin_router,
    prefix="/api/v1",
)

# Public analytics tracking endpoint
app.include_router(
    analytics_public_router,
    prefix="/api/v1",
)


# ============== Exception Handlers ==============


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    logger.error(
        "unhandled_exception",
        path=request.url.path,
        method=request.method,
        error=str(exc),
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
