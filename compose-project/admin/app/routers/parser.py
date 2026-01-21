"""Parser router - comprehensive parser management and control."""
import json
import os
from datetime import datetime, date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter()

# Configuration file path
CONFIG_FILE = "/app/parser_config.json"

# Default configuration
DEFAULT_CONFIG = {
    "interval_minutes": 60,
    "enabled_sources": ["jobs.ge"],
    "regions": [
        {"slug": "adjara", "lid": 14, "name_en": "Adjara", "name_ge": "აჭარა", "enabled": True, "order": 1},
        {"slug": "tbilisi", "lid": 1, "name_en": "Tbilisi", "name_ge": "თბილისი", "enabled": True, "order": 2},
        {"slug": "imereti", "lid": 8, "name_en": "Imereti", "name_ge": "იმერეთი", "enabled": True, "order": 3},
        {"slug": "kakheti", "lid": 3, "name_en": "Kakheti", "name_ge": "კახეთი", "enabled": True, "order": 4},
        {"slug": "kvemo-kartli", "lid": 5, "name_en": "Kvemo Kartli", "name_ge": "ქვემო ქართლი", "enabled": True, "order": 5},
        {"slug": "shida-kartli", "lid": 6, "name_en": "Shida Kartli", "name_ge": "შიდა ქართლი", "enabled": True, "order": 6},
        {"slug": "guria", "lid": 9, "name_en": "Guria", "name_ge": "გურია", "enabled": True, "order": 7},
        {"slug": "samtskhe-javakheti", "lid": 7, "name_en": "Samtskhe-Javakheti", "name_ge": "სამცხე-ჯავახეთი", "enabled": True, "order": 8},
        {"slug": "mtskheta-mtianeti", "lid": 4, "name_en": "Mtskheta-Mtianeti", "name_ge": "მცხეთა-მთიანეთი", "enabled": True, "order": 9},
        {"slug": "samegrelo", "lid": 13, "name_en": "Samegrelo", "name_ge": "სამეგრელო", "enabled": True, "order": 10},
        {"slug": "racha-lechkhumi", "lid": 12, "name_en": "Racha-Lechkhumi", "name_ge": "რაჭა-ლეჩხუმი", "enabled": True, "order": 11},
        {"slug": "remote", "lid": 17, "name_en": "Remote", "name_ge": "დისტანციური", "enabled": True, "order": 12},
        {"slug": "abkhazia", "lid": 15, "name_en": "Abkhazia", "name_ge": "აფხაზეთი", "enabled": False, "order": 13},
        {"slug": "abroad", "lid": 16, "name_en": "Abroad", "name_ge": "უცხოეთი", "enabled": False, "order": 14},
    ],
    "categories": [
        {"slug": "hr-admin", "cid": 1, "name_en": "Administration/Management", "name_ge": "ადმინისტრაცია/მენეჯმენტი", "enabled": True, "order": 1},
        {"slug": "sales-marketing", "cid": 2, "name_en": "Sales", "name_ge": "გაყიდვები", "enabled": True, "order": 2},
        {"slug": "finance-accounting", "cid": 3, "name_en": "Finance/Statistics", "name_ge": "ფინანსები/სტატისტიკა", "enabled": True, "order": 3},
        {"slug": "sales-marketing-pr", "cid": 4, "name_en": "PR/Marketing", "name_ge": "PR/მარკეტინგი", "enabled": True, "order": 4},
        {"slug": "logistics-transport", "cid": 5, "name_en": "Logistics/Transport", "name_ge": "ლოგისტიკა/ტრანსპორტი", "enabled": True, "order": 5},
        {"slug": "it-programming", "cid": 6, "name_en": "IT/Programming", "name_ge": "IT/პროგრამირება", "enabled": True, "order": 6},
        {"slug": "legal", "cid": 7, "name_en": "Law", "name_ge": "სამართალი", "enabled": True, "order": 7},
        {"slug": "medicine-healthcare", "cid": 8, "name_en": "Medicine/Pharmacy", "name_ge": "მედიცინა/ფარმაცია", "enabled": True, "order": 8},
        {"slug": "other", "cid": 9, "name_en": "Other", "name_ge": "სხვა", "enabled": True, "order": 9},
        {"slug": "tourism-hospitality", "cid": 10, "name_en": "Food/Catering", "name_ge": "კვება", "enabled": True, "order": 10},
        {"slug": "construction", "cid": 11, "name_en": "Construction/Repair", "name_ge": "მშენებლობა/რემონტი", "enabled": True, "order": 11},
        {"slug": "education", "cid": 12, "name_en": "Education", "name_ge": "განათლება", "enabled": True, "order": 12},
        {"slug": "design-creative", "cid": 13, "name_en": "Media/Publishing", "name_ge": "მედია/გამომცემლობა", "enabled": True, "order": 13},
        {"slug": "design-creative-beauty", "cid": 14, "name_en": "Beauty/Fashion", "name_ge": "სილამაზე/მოდა", "enabled": True, "order": 14},
        {"slug": "other-cleaning", "cid": 16, "name_en": "Cleaning", "name_ge": "დასუფთავება", "enabled": True, "order": 15},
        {"slug": "hr-admin-security", "cid": 17, "name_en": "Security/Safety", "name_ge": "დაცვა/უსაფრთხოება", "enabled": True, "order": 16},
        {"slug": "manufacturing", "cid": 18, "name_en": "Technical Staff", "name_ge": "ზოგადი ტექნიკური პერსონალი", "enabled": True, "order": 17},
    ],
    "last_updated": None
}


# ============================================================================
# Pydantic Models
# ============================================================================

class RegionConfig(BaseModel):
    slug: str
    lid: int
    name_en: str
    name_ge: str
    enabled: bool
    order: int


class CategoryConfig(BaseModel):
    slug: str
    cid: int
    name_en: str
    name_ge: str
    enabled: bool
    order: int


class ParserConfig(BaseModel):
    interval_minutes: int
    enabled_sources: List[str]
    regions: List[RegionConfig]
    categories: List[CategoryConfig]
    last_updated: Optional[str] = None


class TriggerParseRequest(BaseModel):
    regions: Optional[List[str]] = None  # List of region slugs, None = all enabled
    categories: Optional[List[int]] = None  # List of category cids, None = all enabled


class DeleteDataRequest(BaseModel):
    region_slugs: Optional[List[str]] = None
    category_slugs: Optional[List[str]] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    source: Optional[str] = None
    delete_all: bool = False


# ============================================================================
# Configuration Management
# ============================================================================

def load_config() -> dict:
    """Load parser configuration from file."""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
    except Exception:
        pass
    return DEFAULT_CONFIG.copy()


def save_config(config: dict) -> None:
    """Save parser configuration to file."""
    config['last_updated'] = datetime.utcnow().isoformat()
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)


# ============================================================================
# Parser Statistics Endpoints
# ============================================================================

@router.get("/stats")
async def get_parser_stats(db: AsyncSession = Depends(get_db)):
    """Get parser statistics by region and category."""
    # Total jobs
    result = await db.execute(text("SELECT COUNT(*) FROM jobs"))
    total_jobs = result.scalar() or 0

    # Jobs by region (using location field since region_id might be null)
    result = await db.execute(text("""
        SELECT
            COALESCE(r.name_en, j.location, 'Unknown') as name_en,
            COALESCE(r.name_ge, j.location, 'უცნობი') as name_ge,
            COALESCE(r.slug, 'unknown') as slug,
            COUNT(*) as count
        FROM jobs j
        LEFT JOIN regions r ON j.region_id = r.id
        GROUP BY r.name_en, r.name_ge, r.slug, j.location
        ORDER BY count DESC
    """))
    by_region = [
        {"name_en": row[0], "name_ge": row[1], "slug": row[2], "count": row[3]}
        for row in result.fetchall()
    ]

    # Jobs by category
    result = await db.execute(text("""
        SELECT
            COALESCE(c.name_en, 'Unknown') as name_en,
            COALESCE(c.name_ge, 'უცნობი') as name_ge,
            COALESCE(c.slug, 'unknown') as slug,
            COUNT(*) as count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        GROUP BY c.id, c.name_en, c.name_ge, c.slug
        ORDER BY count DESC
    """))
    by_category = [
        {"name_en": row[0], "name_ge": row[1], "slug": row[2], "count": row[3]}
        for row in result.fetchall()
    ]

    # Last parsed job
    result = await db.execute(text("""
        SELECT MAX(last_seen_at) FROM jobs WHERE parsed_from != 'manual'
    """))
    last_parsed = result.scalar()

    # Jobs parsed today
    result = await db.execute(text("""
        SELECT COUNT(*) FROM jobs
        WHERE first_seen_at >= CURRENT_DATE AND parsed_from != 'manual'
    """))
    parsed_today = result.scalar() or 0

    # Jobs by source
    result = await db.execute(text("""
        SELECT parsed_from, COUNT(*) as count
        FROM jobs
        GROUP BY parsed_from
        ORDER BY count DESC
    """))
    by_source = [{"source": row[0], "count": row[1]} for row in result.fetchall()]

    return {
        "total_jobs": total_jobs,
        "total_regions": len([r for r in by_region if r["name_en"] != 'Unknown']),
        "total_categories": len([c for c in by_category if c["name_en"] != 'Unknown']),
        "parsed_today": parsed_today,
        "last_parsed": last_parsed.isoformat() if last_parsed else None,
        "by_region": by_region,
        "by_category": by_category,
        "by_source": by_source,
    }


@router.get("/sources")
async def get_parser_sources(db: AsyncSession = Depends(get_db)):
    """Get parser source statistics."""
    result = await db.execute(text("""
        SELECT parsed_from, COUNT(*) as count
        FROM jobs
        GROUP BY parsed_from
        ORDER BY count DESC
    """))
    sources = [{"source": row[0], "count": row[1]} for row in result.fetchall()]
    return {"sources": sources}


# ============================================================================
# Configuration Endpoints
# ============================================================================

@router.get("/config")
async def get_parser_config():
    """Get current parser configuration."""
    return load_config()


@router.put("/config")
async def update_parser_config(config: ParserConfig):
    """Update parser configuration."""
    config_dict = config.dict()
    save_config(config_dict)
    return {"status": "success", "message": "Configuration updated", "config": config_dict}


@router.get("/regions")
async def get_regions_config():
    """Get all regions with their configuration."""
    config = load_config()
    return {"regions": sorted(config.get("regions", []), key=lambda x: x["order"])}


@router.put("/regions")
async def update_regions_config(regions: List[RegionConfig]):
    """Update regions configuration (order and enabled status)."""
    config = load_config()
    config["regions"] = [r.dict() for r in regions]
    save_config(config)
    return {"status": "success", "regions": config["regions"]}


@router.get("/categories")
async def get_categories_config():
    """Get all categories with their configuration."""
    config = load_config()
    return {"categories": sorted(config.get("categories", []), key=lambda x: x["order"])}


@router.put("/categories")
async def update_categories_config(categories: List[CategoryConfig]):
    """Update categories configuration (order and enabled status)."""
    config = load_config()
    config["categories"] = [c.dict() for c in categories]
    save_config(config)
    return {"status": "success", "categories": config["categories"]}


# ============================================================================
# Manual Parse Trigger
# ============================================================================

@router.post("/trigger")
async def trigger_parse(request: TriggerParseRequest):
    """Trigger a manual parse run.

    This creates a signal file that the worker will pick up.
    In production, this could use Redis/message queue for better reliability.
    """
    import httpx

    # Build the regions parameter
    config = load_config()

    if request.regions:
        regions = request.regions
    else:
        # Use all enabled regions from config
        regions = [r["slug"] for r in config["regions"] if r["enabled"]]

    # For now, we'll try to call the worker's API if available
    # Otherwise, we'll create a trigger file
    trigger_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "regions": regions,
        "categories": request.categories,
        "triggered_by": "admin"
    }

    # Save trigger file for worker to pick up
    trigger_file = "/app/parse_trigger.json"
    try:
        with open(trigger_file, 'w') as f:
            json.dump(trigger_data, f)
    except Exception:
        pass

    return {
        "status": "triggered",
        "message": f"Parse triggered for regions: {', '.join(regions)}",
        "trigger_data": trigger_data
    }


@router.get("/status")
async def get_parser_status():
    """Get current parser status."""
    # Check for trigger file
    trigger_file = "/app/parse_trigger.json"
    pending_trigger = None
    if os.path.exists(trigger_file):
        try:
            with open(trigger_file, 'r') as f:
                pending_trigger = json.load(f)
        except Exception:
            pass

    config = load_config()
    enabled_regions = [r["name_en"] for r in config["regions"] if r["enabled"]]
    enabled_categories = [c["name_en"] for c in config["categories"] if c["enabled"]]

    return {
        "status": "running" if pending_trigger else "idle",
        "interval_minutes": config.get("interval_minutes", 60),
        "enabled_regions": enabled_regions,
        "enabled_categories": enabled_categories,
        "pending_trigger": pending_trigger,
        "last_updated": config.get("last_updated")
    }


# ============================================================================
# Data Management Endpoints
# ============================================================================

@router.post("/data/preview-delete")
async def preview_delete(request: DeleteDataRequest, db: AsyncSession = Depends(get_db)):
    """Preview how many jobs would be deleted with given filters."""
    conditions = []
    params = {}

    if request.delete_all:
        # Will delete all jobs
        pass
    else:
        if request.region_slugs:
            conditions.append("r.slug = ANY(:region_slugs)")
            params["region_slugs"] = request.region_slugs

        if request.category_slugs:
            conditions.append("c.slug = ANY(:category_slugs)")
            params["category_slugs"] = request.category_slugs

        if request.date_from:
            conditions.append("j.created_at >= :date_from")
            params["date_from"] = request.date_from

        if request.date_to:
            conditions.append("j.created_at <= :date_to")
            params["date_to"] = request.date_to

        if request.source:
            conditions.append("j.parsed_from = :source")
            params["source"] = request.source

    where_clause = " AND ".join(conditions) if conditions else "1=1"

    query = f"""
        SELECT COUNT(*) FROM jobs j
        LEFT JOIN regions r ON j.region_id = r.id
        LEFT JOIN categories c ON j.category_id = c.id
        WHERE {where_clause}
    """

    result = await db.execute(text(query), params)
    count = result.scalar() or 0

    # Get breakdown
    breakdown_query = f"""
        SELECT
            COALESCE(c.name_en, 'Unknown') as category,
            COALESCE(r.name_en, j.location, 'Unknown') as region,
            COUNT(*) as count
        FROM jobs j
        LEFT JOIN regions r ON j.region_id = r.id
        LEFT JOIN categories c ON j.category_id = c.id
        WHERE {where_clause}
        GROUP BY c.name_en, r.name_en, j.location
        ORDER BY count DESC
        LIMIT 20
    """

    result = await db.execute(text(breakdown_query), params)
    breakdown = [{"category": row[0], "region": row[1], "count": row[2]} for row in result.fetchall()]

    return {
        "total_to_delete": count,
        "breakdown": breakdown,
        "filters": {
            "regions": request.region_slugs,
            "categories": request.category_slugs,
            "date_from": str(request.date_from) if request.date_from else None,
            "date_to": str(request.date_to) if request.date_to else None,
            "source": request.source,
            "delete_all": request.delete_all
        }
    }


@router.post("/data/delete")
async def delete_data(request: DeleteDataRequest, db: AsyncSession = Depends(get_db)):
    """Delete jobs matching the given filters."""
    conditions = []
    params = {}

    if request.delete_all:
        # Delete all jobs - requires explicit flag
        if not request.delete_all:
            raise HTTPException(status_code=400, detail="Must set delete_all=true to delete all data")
    else:
        if request.region_slugs:
            # Need to use subquery for region
            conditions.append("""
                region_id IN (SELECT id FROM regions WHERE slug = ANY(:region_slugs))
            """)
            params["region_slugs"] = request.region_slugs

        if request.category_slugs:
            conditions.append("""
                category_id IN (SELECT id FROM categories WHERE slug = ANY(:category_slugs))
            """)
            params["category_slugs"] = request.category_slugs

        if request.date_from:
            conditions.append("created_at >= :date_from")
            params["date_from"] = request.date_from

        if request.date_to:
            conditions.append("created_at <= :date_to")
            params["date_to"] = request.date_to

        if request.source:
            conditions.append("parsed_from = :source")
            params["source"] = request.source

    where_clause = " AND ".join(conditions) if conditions else "1=1"

    # First get count
    count_query = f"SELECT COUNT(*) FROM jobs WHERE {where_clause}"
    result = await db.execute(text(count_query), params)
    count = result.scalar() or 0

    if count == 0:
        return {"status": "success", "deleted": 0, "message": "No jobs matched the filters"}

    # Delete
    delete_query = f"DELETE FROM jobs WHERE {where_clause}"
    await db.execute(text(delete_query), params)
    await db.commit()

    return {
        "status": "success",
        "deleted": count,
        "message": f"Successfully deleted {count} jobs"
    }


@router.get("/data/stats")
async def get_data_stats(db: AsyncSession = Depends(get_db)):
    """Get data statistics for management UI."""
    # Jobs by date
    result = await db.execute(text("""
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM jobs
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    """))
    by_date = [{"date": str(row[0]), "count": row[1]} for row in result.fetchall()]

    # Jobs by source
    result = await db.execute(text("""
        SELECT parsed_from, COUNT(*) as count
        FROM jobs
        GROUP BY parsed_from
        ORDER BY count DESC
    """))
    by_source = [{"source": row[0], "count": row[1]} for row in result.fetchall()]

    # Jobs by region (from location field)
    result = await db.execute(text("""
        SELECT
            COALESCE(r.name_en, j.location, 'Unknown') as region,
            COALESCE(r.slug, 'unknown') as slug,
            COUNT(*) as count
        FROM jobs j
        LEFT JOIN regions r ON j.region_id = r.id
        GROUP BY r.name_en, r.slug, j.location
        ORDER BY count DESC
    """))
    by_region = [{"region": row[0], "slug": row[1], "count": row[2]} for row in result.fetchall()]

    # Jobs by category
    result = await db.execute(text("""
        SELECT
            COALESCE(c.name_en, 'Unknown') as category,
            COALESCE(c.slug, 'unknown') as slug,
            COUNT(*) as count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        GROUP BY c.name_en, c.slug
        ORDER BY count DESC
    """))
    by_category = [{"category": row[0], "slug": row[1], "count": row[2]} for row in result.fetchall()]

    # Total
    result = await db.execute(text("SELECT COUNT(*) FROM jobs"))
    total = result.scalar() or 0

    # Date range
    result = await db.execute(text("""
        SELECT MIN(created_at), MAX(created_at) FROM jobs
    """))
    row = result.fetchone()

    return {
        "total": total,
        "by_date": by_date,
        "by_source": by_source,
        "by_region": by_region,
        "by_category": by_category,
        "date_range": {
            "min": row[0].isoformat() if row[0] else None,
            "max": row[1].isoformat() if row[1] else None
        }
    }
