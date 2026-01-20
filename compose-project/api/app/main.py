"""FastAPI application entry point."""
import os
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db
from app.core.logging import configure_logging, get_logger, bind_request_context, clear_request_context

# Configure structured logging
configure_logging(
    log_level=settings.LOG_LEVEL,
    json_output=settings.LOG_JSON,
)

# Initialize Sentry for error monitoring (if configured)
SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
    from sentry_sdk.integrations.asyncpg import AsyncPGIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        release=settings.APP_VERSION,
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            SqlalchemyIntegration(),
            AsyncPGIntegration(),
        ],
        # Performance monitoring
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
        # Profile sampling (for profiling)
        profiles_sample_rate=float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "0.1")),
        # Don't send PII
        send_default_pii=False,
        # Add debug info
        attach_stacktrace=True,
    )
from app.routers import jobs_router, categories_router, regions_router, admin_router
from app.routers.admin_parser import router as parser_admin_router
from app.routers.admin_analytics import router as analytics_admin_router, public_router as analytics_public_router
from app.routers.admin_backup import router as backup_admin_router
from app.routers.stats import router as stats_router

logger = get_logger(__name__)


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


# Add request ID middleware for log correlation
@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    """Add request ID for log correlation."""
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    bind_request_context(
        request_id=request_id,
        path=request.url.path,
        method=request.method,
    )
    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
    finally:
        clear_request_context()


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
    from app.core.database import async_session_maker
    from sqlalchemy import text

    try:
        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {"status": "ready" if db_status == "connected" else "degraded", "database": db_status}


@app.get("/health/detailed", tags=["System"])
async def detailed_health_check():
    """Detailed health check including backup and parser status.

    Returns comprehensive health information for monitoring systems.
    Used by UptimeRobot, BetterStack, or similar services.
    """
    from datetime import datetime, timedelta
    from pathlib import Path
    from app.core.database import async_session_maker
    from sqlalchemy import text

    health = {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {}
    }

    issues = []

    # Check 1: Database
    try:
        async with async_session_maker() as session:
            result = await session.execute(text("SELECT COUNT(*) FROM jobs"))
            job_count = result.scalar()
        health["checks"]["database"] = {
            "status": "healthy",
            "job_count": job_count
        }
    except Exception as e:
        health["checks"]["database"] = {"status": "error", "message": str(e)}
        issues.append("database")

    # Check 2: Backup status
    backup_dir = Path("/backups") if Path("/backups").exists() else Path("./backups")
    try:
        backup_files = []
        for subdir in ["daily", "weekly", "manual"]:
            dir_path = backup_dir / subdir
            if dir_path.exists():
                backup_files.extend(dir_path.glob("*.sql.gz"))

        if backup_files:
            # Get most recent backup
            latest = max(backup_files, key=lambda f: f.stat().st_mtime)
            backup_age_hours = (datetime.now() - datetime.fromtimestamp(latest.stat().st_mtime)).total_seconds() / 3600

            backup_status = "healthy"
            if backup_age_hours > 48:
                backup_status = "warning"
                issues.append("backup_old")
            if backup_age_hours > 72:
                backup_status = "critical"

            health["checks"]["backup"] = {
                "status": backup_status,
                "last_backup": datetime.fromtimestamp(latest.stat().st_mtime).isoformat(),
                "age_hours": round(backup_age_hours, 1),
                "file_count": len(backup_files)
            }
        else:
            health["checks"]["backup"] = {
                "status": "warning",
                "message": "No backup files found",
                "file_count": 0
            }
            issues.append("no_backups")
    except Exception as e:
        health["checks"]["backup"] = {"status": "error", "message": str(e)}
        issues.append("backup_check_failed")

    # Check 3: Parser status (last run)
    try:
        async with async_session_maker() as session:
            result = await session.execute(
                text("SELECT MAX(last_seen_at) FROM jobs WHERE parsed_from != 'manual'")
            )
            last_parsed = result.scalar()

            if last_parsed:
                parser_age_hours = (datetime.utcnow() - last_parsed.replace(tzinfo=None)).total_seconds() / 3600
                parser_status = "healthy"
                if parser_age_hours > 4:  # Parser should run hourly
                    parser_status = "warning"
                if parser_age_hours > 24:
                    parser_status = "critical"
                    issues.append("parser_stale")

                health["checks"]["parser"] = {
                    "status": parser_status,
                    "last_job_seen": last_parsed.isoformat(),
                    "age_hours": round(parser_age_hours, 1)
                }
            else:
                health["checks"]["parser"] = {
                    "status": "warning",
                    "message": "No parsed jobs found"
                }
    except Exception as e:
        health["checks"]["parser"] = {"status": "error", "message": str(e)}

    # Set overall status
    if any(health["checks"][c].get("status") == "error" for c in health["checks"]):
        health["status"] = "error"
    elif any(health["checks"][c].get("status") == "critical" for c in health["checks"]):
        health["status"] = "critical"
    elif any(health["checks"][c].get("status") == "warning" for c in health["checks"]):
        health["status"] = "warning"

    if issues:
        health["issues"] = issues

    return health


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

# Stats endpoint (public - for parser status)
app.include_router(
    stats_router,
    prefix="/api/v1",
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

# Backup admin endpoints (protected by API key)
app.include_router(
    backup_admin_router,
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
