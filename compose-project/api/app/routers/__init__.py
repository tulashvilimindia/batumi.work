"""API routers."""
from app.routers.jobs import router as jobs_router
from app.routers.categories import router as categories_router
from app.routers.regions import router as regions_router
from app.routers.admin import router as admin_router

__all__ = ["jobs_router", "categories_router", "regions_router", "admin_router"]
