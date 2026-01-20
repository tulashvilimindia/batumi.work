"""Admin Dashboard - Main FastAPI Application."""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.config import settings
from app.routers import dashboard, jobs, parser, analytics, backups, database, logs

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/api/docs",
    redoc_url=None,
)

# Include routers
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(parser.router, prefix="/api/parser", tags=["Parser"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(backups.router, prefix="/api/backups", tags=["Backups"])
app.include_router(database.router, prefix="/api/database", tags=["Database"])
app.include_router(logs.router, prefix="/api/logs", tags=["Logs"])

# Mount static files
static_path = Path(__file__).parent / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")


@app.get("/", include_in_schema=False)
async def root():
    """Serve the main dashboard page."""
    return FileResponse(str(static_path / "index.html"))


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "admin", "version": settings.VERSION}
