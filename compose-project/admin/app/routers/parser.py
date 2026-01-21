"""Parser router - comprehensive parser management, progress tracking, and job history.

This router provides:
- Parser configuration management
- Job history with detailed progress tracking
- Manual parse triggering with live progress
- Parse single job by ID
- Retry failed jobs
- Data management (delete by filters)
"""
import json
import os
import httpx
from datetime import datetime, date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter()

# Configuration file path
CONFIG_FILE = "/app/parser_config.json"

# Worker API URL (internal Docker network)
WORKER_API_URL = os.environ.get("WORKER_API_URL", "http://worker:8000")

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
    regions: Optional[List[str]] = None
    categories: Optional[List[int]] = None
    source: str = "jobs.ge"


class ParseSingleRequest(BaseModel):
    external_id: str
    source: str = "jobs.ge"


class RetryJobRequest(BaseModel):
    job_id: str


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
# Job History Endpoints
# ============================================================================

@router.get("/jobs")
async def get_parse_jobs(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    status: Optional[str] = None,
    job_type: Optional[str] = None,
):
    """Get parse job history with pagination and filtering."""
    conditions = []
    params = {"limit": limit, "offset": offset}

    if status:
        conditions.append("status = :status")
        params["status"] = status

    if job_type:
        conditions.append("job_type = :job_type")
        params["job_type"] = job_type

    where_clause = " AND ".join(conditions) if conditions else "1=1"

    # Get total count
    count_query = f"SELECT COUNT(*) FROM parse_jobs WHERE {where_clause}"
    result = await db.execute(text(count_query), params)
    total = result.scalar() or 0

    # Get jobs
    query = f"""
        SELECT
            id, job_type, source, status, config,
            total_items, processed_items, successful_items, failed_items,
            skipped_items, new_items, updated_items,
            current_region, current_category, current_page,
            created_at, started_at, completed_at,
            error_message, errors, triggered_by
        FROM parse_jobs
        WHERE {where_clause}
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """

    result = await db.execute(text(query), params)
    rows = result.fetchall()

    jobs = []
    for row in rows:
        duration = None
        if row[17] and row[16]:  # completed_at and started_at
            duration = (row[17] - row[16]).total_seconds()

        percentage = 0
        if row[5] and row[5] > 0:  # total_items
            percentage = round((row[6] / row[5]) * 100, 1)

        jobs.append({
            "id": str(row[0]),
            "job_type": row[1],
            "source": row[2],
            "status": row[3],
            "config": row[4],
            "progress": {
                "total": row[5] or 0,
                "processed": row[6] or 0,
                "successful": row[7] or 0,
                "failed": row[8] or 0,
                "skipped": row[9] or 0,
                "new": row[10] or 0,
                "updated": row[11] or 0,
                "percentage": percentage,
            },
            "current": {
                "region": row[12],
                "category": row[13],
                "page": row[14],
            },
            "timing": {
                "created_at": row[15].isoformat() if row[15] else None,
                "started_at": row[16].isoformat() if row[16] else None,
                "completed_at": row[17].isoformat() if row[17] else None,
                "duration_seconds": duration,
            },
            "error_message": row[18],
            "errors": row[19] or [],
            "triggered_by": row[20],
        })

    return {
        "jobs": jobs,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/jobs/{job_id}")
async def get_parse_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """Get detailed information about a specific parse job."""
    query = """
        SELECT
            id, job_type, source, status, config,
            total_items, processed_items, successful_items, failed_items,
            skipped_items, new_items, updated_items,
            current_region, current_category, current_page,
            created_at, started_at, completed_at,
            error_message, errors, triggered_by
        FROM parse_jobs
        WHERE id = :job_id
    """

    result = await db.execute(text(query), {"job_id": job_id})
    row = result.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Parse job not found")

    duration = None
    if row[17] and row[16]:
        duration = (row[17] - row[16]).total_seconds()

    percentage = 0
    if row[5] and row[5] > 0:
        percentage = round((row[6] / row[5]) * 100, 1)

    return {
        "id": str(row[0]),
        "job_type": row[1],
        "source": row[2],
        "status": row[3],
        "config": row[4],
        "progress": {
            "total": row[5] or 0,
            "processed": row[6] or 0,
            "successful": row[7] or 0,
            "failed": row[8] or 0,
            "skipped": row[9] or 0,
            "new": row[10] or 0,
            "updated": row[11] or 0,
            "percentage": percentage,
        },
        "current": {
            "region": row[12],
            "category": row[13],
            "page": row[14],
        },
        "timing": {
            "created_at": row[15].isoformat() if row[15] else None,
            "started_at": row[16].isoformat() if row[16] else None,
            "completed_at": row[17].isoformat() if row[17] else None,
            "duration_seconds": duration,
        },
        "error_message": row[18],
        "errors": row[19] or [],
        "triggered_by": row[20],
    }


@router.get("/jobs/{job_id}/progress")
async def get_parse_job_progress(job_id: str, db: AsyncSession = Depends(get_db)):
    """Get real-time progress for a parse job (for polling)."""
    query = """
        SELECT
            status, total_items, processed_items,
            successful_items, failed_items, skipped_items,
            new_items, updated_items,
            current_region, current_category, current_page,
            error_message
        FROM parse_jobs
        WHERE id = :job_id
    """

    result = await db.execute(text(query), {"job_id": job_id})
    row = result.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Parse job not found")

    percentage = 0
    if row[1] and row[1] > 0:
        percentage = round((row[2] / row[1]) * 100, 1)

    return {
        "job_id": job_id,
        "status": row[0],
        "progress": {
            "total": row[1] or 0,
            "processed": row[2] or 0,
            "successful": row[3] or 0,
            "failed": row[4] or 0,
            "skipped": row[5] or 0,
            "new": row[6] or 0,
            "updated": row[7] or 0,
            "percentage": percentage,
        },
        "current": {
            "region": row[8],
            "category": row[9],
            "page": row[10],
        },
        "error_message": row[11],
    }


@router.get("/progress")
async def get_current_progress(db: AsyncSession = Depends(get_db)):
    """Get progress of currently running parse job (if any)."""
    query = """
        SELECT
            id, job_type, source, status,
            total_items, processed_items, successful_items,
            failed_items, skipped_items, new_items, updated_items,
            current_region, current_category, current_page,
            started_at, error_message
        FROM parse_jobs
        WHERE status = 'running'
        ORDER BY created_at DESC
        LIMIT 1
    """

    result = await db.execute(text(query))
    row = result.fetchone()

    if not row:
        return {
            "running": False,
            "job": None,
        }

    percentage = 0
    if row[4] and row[4] > 0:
        percentage = round((row[5] / row[4]) * 100, 1)

    elapsed = None
    if row[14]:
        elapsed = (datetime.utcnow() - row[14].replace(tzinfo=None)).total_seconds()

    return {
        "running": True,
        "job": {
            "id": str(row[0]),
            "job_type": row[1],
            "source": row[2],
            "status": row[3],
            "progress": {
                "total": row[4] or 0,
                "processed": row[5] or 0,
                "successful": row[6] or 0,
                "failed": row[7] or 0,
                "skipped": row[8] or 0,
                "new": row[9] or 0,
                "updated": row[10] or 0,
                "percentage": percentage,
            },
            "current": {
                "region": row[11],
                "category": row[12],
                "page": row[13],
            },
            "elapsed_seconds": elapsed,
            "error_message": row[15],
        },
    }


# ============================================================================
# Parse Trigger and Single Job Parse
# ============================================================================

@router.post("/trigger")
async def trigger_parse(request: TriggerParseRequest, db: AsyncSession = Depends(get_db)):
    """Trigger a manual parse run and return job ID for tracking.

    This creates a parse job record and signals the worker to start parsing.
    Use the returned job_id to track progress via /api/parser/jobs/{job_id}/progress
    """
    config = load_config()

    if request.regions:
        regions = request.regions
    else:
        regions = [r["slug"] for r in config["regions"] if r["enabled"]]

    # Create parse job record directly in database
    job_id_query = """
        INSERT INTO parse_jobs (
            job_type, source, status, config, triggered_by, created_at
        ) VALUES (
            'manual', :source, 'pending',
            :config::jsonb, 'admin', NOW()
        )
        RETURNING id
    """

    result = await db.execute(
        text(job_id_query),
        {
            "source": request.source,
            "config": json.dumps({
                "regions": regions,
                "categories": request.categories,
            })
        }
    )
    job_id = result.fetchone()[0]
    await db.commit()

    # Save trigger file for worker to pick up
    trigger_data = {
        "job_id": str(job_id),
        "timestamp": datetime.utcnow().isoformat(),
        "regions": regions,
        "categories": request.categories,
        "source": request.source,
        "triggered_by": "admin",
        "job_type": "manual",
    }

    trigger_file = "/app/parse_trigger.json"
    try:
        with open(trigger_file, 'w') as f:
            json.dump(trigger_data, f)
    except Exception:
        pass

    return {
        "status": "triggered",
        "job_id": str(job_id),
        "message": f"Parse triggered for regions: {', '.join(regions)}",
        "trigger_data": trigger_data,
    }


@router.post("/parse-single")
async def parse_single_job(request: ParseSingleRequest, db: AsyncSession = Depends(get_db)):
    """Parse a single job by its external ID (e.g., jobs.ge ID).

    This creates a parse job record and signals the worker to parse
    a specific job. Useful for re-parsing or fetching a specific listing.
    """
    # Create parse job record
    job_id_query = """
        INSERT INTO parse_jobs (
            job_type, source, status, config, triggered_by,
            total_items, created_at
        ) VALUES (
            'single', :source, 'pending',
            :config::jsonb, 'admin', 1, NOW()
        )
        RETURNING id
    """

    result = await db.execute(
        text(job_id_query),
        {
            "source": request.source,
            "config": json.dumps({"external_id": request.external_id})
        }
    )
    job_id = result.fetchone()[0]
    await db.commit()

    # Save trigger file for worker
    trigger_data = {
        "job_id": str(job_id),
        "timestamp": datetime.utcnow().isoformat(),
        "external_id": request.external_id,
        "source": request.source,
        "triggered_by": "admin",
        "job_type": "single",
    }

    trigger_file = "/app/parse_trigger.json"
    try:
        with open(trigger_file, 'w') as f:
            json.dump(trigger_data, f)
    except Exception:
        pass

    # Build the expected URL for user reference
    if request.source == "jobs.ge":
        url = f"https://jobs.ge/ge/?view=jobs&id={request.external_id}"
    else:
        url = None

    return {
        "status": "triggered",
        "job_id": str(job_id),
        "external_id": request.external_id,
        "source": request.source,
        "url": url,
        "message": f"Single job parse triggered for ID: {request.external_id}",
    }


@router.post("/jobs/{job_id}/retry")
async def retry_failed_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """Retry a failed parse job.

    Creates a new parse job with the same configuration as the original.
    """
    # Get original job config
    query = """
        SELECT config, source FROM parse_jobs WHERE id = :job_id
    """
    result = await db.execute(text(query), {"job_id": job_id})
    row = result.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Parse job not found")

    original_config = row[0]
    source = row[1]

    # Create new retry job
    new_job_query = """
        INSERT INTO parse_jobs (
            job_type, source, status, config, triggered_by, created_at
        ) VALUES (
            'retry', :source, 'pending', :config::jsonb, 'admin', NOW()
        )
        RETURNING id
    """

    result = await db.execute(
        text(new_job_query),
        {"source": source, "config": json.dumps(original_config)}
    )
    new_job_id = result.fetchone()[0]
    await db.commit()

    # Save trigger file
    trigger_data = {
        "job_id": str(new_job_id),
        "original_job_id": job_id,
        "timestamp": datetime.utcnow().isoformat(),
        "triggered_by": "admin",
        "job_type": "retry",
        "source": source,
        **(original_config or {}),
    }

    trigger_file = "/app/parse_trigger.json"
    try:
        with open(trigger_file, 'w') as f:
            json.dump(trigger_data, f)
    except Exception:
        pass

    return {
        "status": "triggered",
        "job_id": str(new_job_id),
        "original_job_id": job_id,
        "message": "Retry job created and triggered",
    }


@router.post("/jobs/{job_id}/cancel")
async def cancel_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """Cancel a running parse job.

    Note: This marks the job as cancelled but may not immediately stop
    the worker if it's mid-parse. The worker should check for cancellation.
    """
    # Update job status
    query = """
        UPDATE parse_jobs
        SET status = 'cancelled', completed_at = NOW()
        WHERE id = :job_id AND status = 'running'
        RETURNING id
    """

    result = await db.execute(text(query), {"job_id": job_id})
    row = result.fetchone()
    await db.commit()

    if not row:
        raise HTTPException(
            status_code=400,
            detail="Job not found or not in running status"
        )

    return {
        "status": "cancelled",
        "job_id": job_id,
        "message": "Job marked as cancelled",
    }


# ============================================================================
# Parser Statistics Endpoints
# ============================================================================

@router.get("/stats")
async def get_parser_stats(db: AsyncSession = Depends(get_db)):
    """Get parser statistics by region and category."""
    # Total jobs
    result = await db.execute(text("SELECT COUNT(*) FROM jobs"))
    total_jobs = result.scalar() or 0

    # Jobs by region
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

    # Parse job statistics
    result = await db.execute(text("""
        SELECT
            COUNT(*) as total_jobs,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COUNT(*) FILTER (WHERE status = 'failed') as failed,
            COUNT(*) FILTER (WHERE status = 'running') as running,
            SUM(new_items) as total_new,
            SUM(updated_items) as total_updated
        FROM parse_jobs
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    """))
    job_stats = result.fetchone()

    return {
        "total_jobs": total_jobs,
        "total_regions": len([r for r in by_region if r["name_en"] != 'Unknown']),
        "total_categories": len([c for c in by_category if c["name_en"] != 'Unknown']),
        "parsed_today": parsed_today,
        "last_parsed": last_parsed.isoformat() if last_parsed else None,
        "by_region": by_region,
        "by_category": by_category,
        "by_source": by_source,
        "parse_jobs_7d": {
            "total": job_stats[0] or 0,
            "completed": job_stats[1] or 0,
            "failed": job_stats[2] or 0,
            "running": job_stats[3] or 0,
            "new_items": job_stats[4] or 0,
            "updated_items": job_stats[5] or 0,
        },
    }


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
    """Update regions configuration."""
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
    """Update categories configuration."""
    config = load_config()
    config["categories"] = [c.dict() for c in categories]
    save_config(config)
    return {"status": "success", "categories": config["categories"]}


@router.get("/status")
async def get_parser_status(db: AsyncSession = Depends(get_db)):
    """Get current parser status including any running jobs."""
    config = load_config()
    enabled_regions = [r["name_en"] for r in config["regions"] if r["enabled"]]
    enabled_categories = [c["name_en"] for c in config["categories"] if c["enabled"]]

    # Check for running job
    result = await db.execute(text("""
        SELECT id, current_region, current_category, processed_items, total_items
        FROM parse_jobs
        WHERE status = 'running'
        ORDER BY created_at DESC
        LIMIT 1
    """))
    running_job = result.fetchone()

    return {
        "status": "running" if running_job else "idle",
        "interval_minutes": config.get("interval_minutes", 60),
        "enabled_regions": enabled_regions,
        "enabled_categories": enabled_categories,
        "running_job": {
            "id": str(running_job[0]),
            "current_region": running_job[1],
            "current_category": running_job[2],
            "processed": running_job[3],
            "total": running_job[4],
        } if running_job else None,
        "last_updated": config.get("last_updated"),
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

    if not request.delete_all:
        if request.region_slugs:
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

    count_query = f"SELECT COUNT(*) FROM jobs WHERE {where_clause}"
    result = await db.execute(text(count_query), params)
    count = result.scalar() or 0

    if count == 0:
        return {"status": "success", "deleted": 0, "message": "No jobs matched the filters"}

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
    result = await db.execute(text("""
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM jobs
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    """))
    by_date = [{"date": str(row[0]), "count": row[1]} for row in result.fetchall()]

    result = await db.execute(text("""
        SELECT parsed_from, COUNT(*) as count
        FROM jobs
        GROUP BY parsed_from
        ORDER BY count DESC
    """))
    by_source = [{"source": row[0], "count": row[1]} for row in result.fetchall()]

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

    result = await db.execute(text("SELECT COUNT(*) FROM jobs"))
    total = result.scalar() or 0

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
