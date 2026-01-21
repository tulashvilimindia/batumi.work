"""Parser management router with comprehensive job control.

Provides endpoints for:
- Job history with filtering and pagination
- Real-time progress tracking
- Job control (pause/resume/stop/restart)
- Detailed logs per job/region/category
- Batch job execution
- Skip reason analysis
"""
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from uuid import UUID
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import text, select, update, func, desc, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter()

# Worker service URL
WORKER_URL = "http://worker:8000"


# ============================================================================
# Pydantic Models
# ============================================================================

class TriggerParseRequest(BaseModel):
    regions: Optional[List[str]] = None
    categories: Optional[List[int]] = None
    source: str = "jobs.ge"


class TriggerBatchRequest(BaseModel):
    regions: List[str]
    categories: Optional[List[str]] = None
    mode: str = "sequential"  # "parallel" or "sequential"
    source: str = "jobs.ge"


class ParseSingleRequest(BaseModel):
    external_id: str
    source: str = "jobs.ge"


class JobControlRequest(BaseModel):
    action: str  # "pause", "resume", "stop", "cancel", "restart"


# ============================================================================
# Job History Endpoints
# ============================================================================

@router.get("/jobs")
async def get_parse_jobs(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    status: Optional[str] = None,
    job_type: Optional[str] = None,
    source: Optional[str] = None,
    batch_id: Optional[str] = None,
    region: Optional[str] = None,
    days: int = Query(default=7, ge=1, le=90),
):
    """Get parse job history with filtering."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    # Build query
    where_clauses = ["created_at >= :cutoff"]
    params = {"cutoff": cutoff, "limit": limit, "offset": offset}

    if status:
        where_clauses.append("status = :status")
        params["status"] = status
    if job_type:
        where_clauses.append("job_type = :job_type")
        params["job_type"] = job_type
    if source:
        where_clauses.append("source = :source")
        params["source"] = source
    if batch_id:
        where_clauses.append("batch_id = :batch_id")
        params["batch_id"] = batch_id
    if region:
        where_clauses.append("target_region = :region")
        params["region"] = region

    where_sql = " AND ".join(where_clauses)

    # Get jobs
    result = await db.execute(text(f"""
        SELECT
            id, batch_id, job_type, source, status, config,
            target_region, target_category,
            total_items, processed_items, successful_items, failed_items,
            skipped_items, new_items, updated_items,
            current_region, current_category, current_page, current_item,
            created_at, started_at, paused_at, completed_at,
            pause_duration_seconds, error_message, triggered_by,
            should_pause, should_stop
        FROM parse_jobs
        WHERE {where_sql}
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """), params)

    jobs = []
    for row in result.fetchall():
        jobs.append({
            "id": str(row[0]),
            "batch_id": str(row[1]) if row[1] else None,
            "job_type": row[2],
            "source": row[3],
            "status": row[4],
            "config": row[5],
            "scope": {
                "region": row[6],
                "category": row[7],
            },
            "progress": {
                "total": row[8] or 0,
                "processed": row[9] or 0,
                "successful": row[10] or 0,
                "failed": row[11] or 0,
                "skipped": row[12] or 0,
                "new": row[13] or 0,
                "updated": row[14] or 0,
                "percentage": round((row[9] or 0) / (row[8] or 1) * 100, 1) if row[8] else 0,
            },
            "current": {
                "region": row[15],
                "category": row[16],
                "page": row[17],
                "item": row[18],
            },
            "timing": {
                "created_at": row[19].isoformat() if row[19] else None,
                "started_at": row[20].isoformat() if row[20] else None,
                "paused_at": row[21].isoformat() if row[21] else None,
                "completed_at": row[22].isoformat() if row[22] else None,
                "pause_duration_seconds": row[23] or 0,
            },
            "error_message": row[24],
            "triggered_by": row[25],
            "controls": {
                "should_pause": row[26],
                "should_stop": row[27],
                "can_pause": row[4] == "running",
                "can_resume": row[4] == "paused",
                "can_stop": row[4] in ("running", "paused"),
                "can_restart": row[4] in ("completed", "failed", "cancelled"),
            },
        })

    # Get total count
    count_result = await db.execute(text(f"""
        SELECT COUNT(*) FROM parse_jobs WHERE {where_sql}
    """), params)
    total = count_result.scalar() or 0

    return {
        "jobs": jobs,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/jobs/{job_id}")
async def get_parse_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    include_items: bool = False,
    include_logs: bool = False,
):
    """Get parse job details."""
    result = await db.execute(text("""
        SELECT
            id, batch_id, job_type, source, status, config,
            target_region, target_category,
            total_items, processed_items, successful_items, failed_items,
            skipped_items, new_items, updated_items,
            current_region, current_category, current_page, current_item,
            created_at, started_at, paused_at, resumed_at, completed_at,
            pause_duration_seconds, error_message, errors, triggered_by,
            should_pause, should_stop
        FROM parse_jobs
        WHERE id = :job_id
    """), {"job_id": job_id})

    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Job not found")

    job = {
        "id": str(row[0]),
        "batch_id": str(row[1]) if row[1] else None,
        "job_type": row[2],
        "source": row[3],
        "status": row[4],
        "config": row[5],
        "scope": {
            "region": row[6],
            "category": row[7],
        },
        "progress": {
            "total": row[8] or 0,
            "processed": row[9] or 0,
            "successful": row[10] or 0,
            "failed": row[11] or 0,
            "skipped": row[12] or 0,
            "new": row[13] or 0,
            "updated": row[14] or 0,
            "percentage": round((row[9] or 0) / (row[8] or 1) * 100, 1) if row[8] else 0,
        },
        "current": {
            "region": row[15],
            "category": row[16],
            "page": row[17],
            "item": row[18],
        },
        "timing": {
            "created_at": row[19].isoformat() if row[19] else None,
            "started_at": row[20].isoformat() if row[20] else None,
            "paused_at": row[21].isoformat() if row[21] else None,
            "resumed_at": row[22].isoformat() if row[22] else None,
            "completed_at": row[23].isoformat() if row[23] else None,
            "pause_duration_seconds": row[24] or 0,
        },
        "error_message": row[25],
        "errors": row[26] or [],
        "triggered_by": row[27],
        "controls": {
            "should_pause": row[28],
            "should_stop": row[29],
            "can_pause": row[4] == "running",
            "can_resume": row[4] == "paused",
            "can_stop": row[4] in ("running", "paused"),
            "can_restart": row[4] in ("completed", "failed", "cancelled"),
        },
    }

    if include_items:
        items_result = await db.execute(text("""
            SELECT
                id, external_id, url, title, status, result,
                skip_reason, skip_details, region, category, page,
                error_message, retry_count, processing_ms,
                created_at, started_at, completed_at
            FROM parse_job_items
            WHERE job_id = :job_id
            ORDER BY created_at DESC
            LIMIT 500
        """), {"job_id": job_id})

        job["items"] = [{
            "id": str(r[0]),
            "external_id": r[1],
            "url": r[2],
            "title": r[3],
            "status": r[4],
            "result": r[5],
            "skip_reason": r[6],
            "skip_details": r[7],
            "region": r[8],
            "category": r[9],
            "page": r[10],
            "error_message": r[11],
            "retry_count": r[12],
            "processing_ms": r[13],
            "timing": {
                "created_at": r[14].isoformat() if r[14] else None,
                "started_at": r[15].isoformat() if r[15] else None,
                "completed_at": r[16].isoformat() if r[16] else None,
            },
        } for r in items_result.fetchall()]

    if include_logs:
        logs_result = await db.execute(text("""
            SELECT
                id, level, region, category, external_id,
                message, details, created_at
            FROM parse_job_logs
            WHERE job_id = :job_id
            ORDER BY created_at DESC
            LIMIT 500
        """), {"job_id": job_id})

        job["logs"] = [{
            "id": str(r[0]),
            "level": r[1],
            "region": r[2],
            "category": r[3],
            "external_id": r[4],
            "message": r[5],
            "details": r[6],
            "created_at": r[7].isoformat() if r[7] else None,
        } for r in logs_result.fetchall()]

    return job


@router.get("/jobs/{job_id}/items")
async def get_parse_job_items(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    status: Optional[str] = None,
    result: Optional[str] = None,
    skip_reason: Optional[str] = None,
    region: Optional[str] = None,
    category: Optional[str] = None,
):
    """Get items for a parse job with filtering."""
    where_clauses = ["job_id = :job_id"]
    params = {"job_id": job_id, "limit": limit, "offset": offset}

    if status:
        where_clauses.append("status = :status")
        params["status"] = status
    if result:
        where_clauses.append("result = :result")
        params["result"] = result
    if skip_reason:
        where_clauses.append("skip_reason = :skip_reason")
        params["skip_reason"] = skip_reason
    if region:
        where_clauses.append("region = :region")
        params["region"] = region
    if category:
        where_clauses.append("category = :category")
        params["category"] = category

    where_sql = " AND ".join(where_clauses)

    items_result = await db.execute(text(f"""
        SELECT
            id, external_id, url, title, status, result,
            skip_reason, skip_details, region, category, page,
            error_message, retry_count, processing_ms,
            created_at, started_at, completed_at
        FROM parse_job_items
        WHERE {where_sql}
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """), params)

    items = [{
        "id": str(r[0]),
        "external_id": r[1],
        "url": r[2],
        "title": r[3],
        "status": r[4],
        "result": r[5],
        "skip_reason": r[6],
        "skip_details": r[7],
        "region": r[8],
        "category": r[9],
        "page": r[10],
        "error_message": r[11],
        "retry_count": r[12],
        "processing_ms": r[13],
        "timing": {
            "created_at": r[14].isoformat() if r[14] else None,
            "started_at": r[15].isoformat() if r[15] else None,
            "completed_at": r[16].isoformat() if r[16] else None,
        },
    } for r in items_result.fetchall()]

    # Get total count
    count_result = await db.execute(text(f"""
        SELECT COUNT(*) FROM parse_job_items WHERE {where_sql}
    """), params)
    total = count_result.scalar() or 0

    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/jobs/{job_id}/logs")
async def get_parse_job_logs(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    level: Optional[str] = None,
    region: Optional[str] = None,
    category: Optional[str] = None,
):
    """Get logs for a parse job with filtering."""
    where_clauses = ["job_id = :job_id"]
    params = {"job_id": job_id, "limit": limit, "offset": offset}

    if level:
        where_clauses.append("level = :level")
        params["level"] = level
    if region:
        where_clauses.append("region = :region")
        params["region"] = region
    if category:
        where_clauses.append("category = :category")
        params["category"] = category

    where_sql = " AND ".join(where_clauses)

    logs_result = await db.execute(text(f"""
        SELECT
            id, level, region, category, external_id,
            message, details, created_at
        FROM parse_job_logs
        WHERE {where_sql}
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """), params)

    logs = [{
        "id": str(r[0]),
        "level": r[1],
        "region": r[2],
        "category": r[3],
        "external_id": r[4],
        "message": r[5],
        "details": r[6],
        "created_at": r[7].isoformat() if r[7] else None,
    } for r in logs_result.fetchall()]

    # Get total count
    count_result = await db.execute(text(f"""
        SELECT COUNT(*) FROM parse_job_logs WHERE {where_sql}
    """), params)
    total = count_result.scalar() or 0

    return {
        "logs": logs,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/jobs/{job_id}/skip-reasons")
async def get_skip_reason_summary(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get summary of skip reasons for a job."""
    result = await db.execute(text("""
        SELECT
            skip_reason,
            COUNT(*) as count
        FROM parse_job_items
        WHERE job_id = :job_id AND skip_reason IS NOT NULL
        GROUP BY skip_reason
        ORDER BY count DESC
    """), {"job_id": job_id})

    reasons = [{
        "reason": r[0],
        "count": r[1],
    } for r in result.fetchall()]

    return {"skip_reasons": reasons}


# ============================================================================
# Progress Tracking
# ============================================================================

@router.get("/progress")
async def get_current_progress(db: AsyncSession = Depends(get_db)):
    """Get progress of all currently running jobs."""
    result = await db.execute(text("""
        SELECT
            id, job_type, source, status,
            target_region, target_category,
            total_items, processed_items, successful_items, failed_items,
            skipped_items, new_items, updated_items,
            current_region, current_category, current_page, current_item,
            started_at, error_message
        FROM parse_jobs
        WHERE status IN ('running', 'paused', 'stopping')
        ORDER BY started_at DESC
    """))

    jobs = []
    for row in result.fetchall():
        elapsed = None
        if row[17]:
            elapsed = (datetime.now(timezone.utc) - row[17]).total_seconds()

        jobs.append({
            "id": str(row[0]),
            "job_type": row[1],
            "source": row[2],
            "status": row[3],
            "scope": {
                "region": row[4],
                "category": row[5],
            },
            "progress": {
                "total": row[6] or 0,
                "processed": row[7] or 0,
                "successful": row[8] or 0,
                "failed": row[9] or 0,
                "skipped": row[10] or 0,
                "new": row[11] or 0,
                "updated": row[12] or 0,
                "percentage": round((row[7] or 0) / (row[6] or 1) * 100, 1) if row[6] else 0,
            },
            "current": {
                "region": row[13],
                "category": row[14],
                "page": row[15],
                "item": row[16],
            },
            "elapsed_seconds": elapsed,
            "error_message": row[18],
        })

    return {
        "running": len(jobs) > 0,
        "jobs": jobs,
    }


# ============================================================================
# Job Control
# ============================================================================

@router.post("/jobs/{job_id}/control")
async def control_job(
    job_id: str,
    request: JobControlRequest,
    db: AsyncSession = Depends(get_db),
):
    """Control a parse job (pause/resume/stop/cancel/restart)."""
    action = request.action.lower()

    if action == "pause":
        await db.execute(text("""
            UPDATE parse_jobs
            SET should_pause = true
            WHERE id = :job_id AND status = 'running'
        """), {"job_id": job_id})
        await db.commit()
        return {"success": True, "message": "Pause signal sent"}

    elif action == "resume":
        # Calculate pause duration and update status
        result = await db.execute(text("""
            SELECT paused_at, pause_duration_seconds FROM parse_jobs
            WHERE id = :job_id AND status = 'paused'
        """), {"job_id": job_id})
        row = result.fetchone()

        if not row:
            raise HTTPException(status_code=400, detail="Job is not paused")

        paused_at, current_duration = row
        new_duration = current_duration or 0
        if paused_at:
            new_duration += int((datetime.now(timezone.utc) - paused_at).total_seconds())

        await db.execute(text("""
            UPDATE parse_jobs
            SET status = 'running',
                should_pause = false,
                paused_at = NULL,
                resumed_at = :now,
                pause_duration_seconds = :duration
            WHERE id = :job_id
        """), {"job_id": job_id, "now": datetime.now(timezone.utc), "duration": new_duration})
        await db.commit()
        return {"success": True, "message": "Job resumed"}

    elif action == "stop":
        await db.execute(text("""
            UPDATE parse_jobs
            SET should_stop = true, status = 'stopping'
            WHERE id = :job_id AND status IN ('running', 'paused')
        """), {"job_id": job_id})
        await db.commit()
        return {"success": True, "message": "Stop signal sent"}

    elif action == "cancel":
        await db.execute(text("""
            UPDATE parse_jobs
            SET status = 'cancelled',
                should_stop = true,
                completed_at = :now
            WHERE id = :job_id AND status NOT IN ('completed', 'failed', 'cancelled')
        """), {"job_id": job_id, "now": datetime.now(timezone.utc)})
        await db.commit()
        return {"success": True, "message": "Job cancelled"}

    elif action == "restart":
        # Get the original job config
        result = await db.execute(text("""
            SELECT source, config, target_region, target_category
            FROM parse_jobs WHERE id = :job_id
        """), {"job_id": job_id})
        row = result.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Job not found")

        source, config, region, category = row

        # Trigger new job via worker
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{WORKER_URL}/parse",
                    json={
                        "source": source,
                        "regions": config.get("regions") if config else None,
                        "categories": config.get("categories") if config else None,
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return {"success": True, "message": "Job restarted", "new_job_id": data.get("job_id")}
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to restart: {str(e)}")

    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {action}")


# ============================================================================
# Trigger Parsing
# ============================================================================

@router.post("/trigger")
async def trigger_parse(
    request: TriggerParseRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Trigger a manual parse job."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{WORKER_URL}/parse",
                json={
                    "source": request.source,
                    "regions": request.regions,
                    "categories": request.categories,
                }
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "message": "Parse job started",
                    "job_id": data.get("job_id"),
                }
            else:
                return {
                    "success": False,
                    "message": f"Worker returned {response.status_code}",
                }
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Worker service unavailable")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/trigger-batch")
async def trigger_batch_parse(
    request: TriggerBatchRequest,
    db: AsyncSession = Depends(get_db),
):
    """Trigger a batch of parse jobs (one per region)."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{WORKER_URL}/parse/batch",
                json={
                    "source": request.source,
                    "regions": request.regions,
                    "categories": request.categories,
                    "mode": request.mode,
                }
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "message": "Batch started",
                    "batch_id": data.get("batch_id"),
                }
            else:
                return {
                    "success": False,
                    "message": f"Worker returned {response.status_code}",
                }
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Worker service unavailable")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/parse-single")
async def parse_single_job(
    request: ParseSingleRequest,
    db: AsyncSession = Depends(get_db),
):
    """Parse a single job by its external ID."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{WORKER_URL}/parse/single",
                json={
                    "source": request.source,
                    "external_id": request.external_id,
                }
            )
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "success": False,
                    "message": f"Worker returned {response.status_code}",
                }
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Worker service unavailable")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Statistics
# ============================================================================

@router.get("/stats")
async def get_parser_stats(db: AsyncSession = Depends(get_db)):
    """Get parser statistics."""
    # Job counts
    result = await db.execute(text("SELECT COUNT(*) FROM jobs"))
    total_jobs = result.scalar() or 0

    result = await db.execute(text("SELECT COUNT(*) FROM regions"))
    total_regions = result.scalar() or 0

    result = await db.execute(text("SELECT COUNT(*) FROM categories"))
    total_categories = result.scalar() or 0

    # Today's parsing
    today = datetime.now(timezone.utc).date()
    result = await db.execute(text("""
        SELECT COUNT(*) FROM jobs
        WHERE DATE(created_at) = :today
    """), {"today": today})
    parsed_today = result.scalar() or 0

    # Last parsed
    result = await db.execute(text("""
        SELECT MAX(created_at) FROM jobs
    """))
    last_parsed = result.scalar()

    # By region
    result = await db.execute(text("""
        SELECT r.name_en, r.name_ge, r.slug, COUNT(j.id) as count
        FROM regions r
        LEFT JOIN jobs j ON j.location LIKE '%' || r.name_ge || '%'
        GROUP BY r.id
        ORDER BY count DESC
    """))
    by_region = [{"name_en": r[0], "name_ge": r[1], "slug": r[2], "count": r[3]} for r in result.fetchall()]

    # By category
    result = await db.execute(text("""
        SELECT c.name_en, c.name_ge, c.slug, COUNT(j.id) as count
        FROM categories c
        LEFT JOIN jobs j ON j.category_id = c.id
        GROUP BY c.id
        ORDER BY count DESC
    """))
    by_category = [{"name_en": r[0], "name_ge": r[1], "slug": r[2], "count": r[3]} for r in result.fetchall()]

    # By source
    result = await db.execute(text("""
        SELECT parsed_from as source, COUNT(*) as count
        FROM jobs
        GROUP BY parsed_from
        ORDER BY count DESC
    """))
    by_source = [{"source": r[0], "count": r[1]} for r in result.fetchall()]

    # Parse jobs statistics (7 days)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    result = await db.execute(text("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
            SUM(CASE WHEN status IN ('running', 'paused') THEN 1 ELSE 0 END) as running,
            SUM(COALESCE(new_items, 0)) as new_items,
            SUM(COALESCE(updated_items, 0)) as updated_items,
            SUM(COALESCE(skipped_items, 0)) as skipped_items,
            SUM(COALESCE(failed_items, 0)) as failed_items
        FROM parse_jobs
        WHERE created_at >= :week_ago
    """), {"week_ago": week_ago})
    row = result.fetchone()

    parse_jobs_7d = {
        "total": row[0] or 0,
        "completed": row[1] or 0,
        "failed": row[2] or 0,
        "running": row[3] or 0,
        "new_items": row[4] or 0,
        "updated_items": row[5] or 0,
        "skipped_items": row[6] or 0,
        "failed_items": row[7] or 0,
    }

    # Skip reason breakdown (7 days)
    result = await db.execute(text("""
        SELECT skip_reason, COUNT(*) as count
        FROM parse_job_items
        WHERE skip_reason IS NOT NULL
          AND created_at >= :week_ago
        GROUP BY skip_reason
        ORDER BY count DESC
    """), {"week_ago": week_ago})
    skip_reasons = [{"reason": r[0], "count": r[1]} for r in result.fetchall()]

    return {
        "total_jobs": total_jobs,
        "total_regions": total_regions,
        "total_categories": total_categories,
        "parsed_today": parsed_today,
        "last_parsed": last_parsed.isoformat() if last_parsed else None,
        "by_region": by_region,
        "by_category": by_category,
        "by_source": by_source,
        "parse_jobs_7d": parse_jobs_7d,
        "skip_reasons_7d": skip_reasons,
    }


# ============================================================================
# Configuration & Data
# ============================================================================

@router.get("/config")
async def get_parser_config(db: AsyncSession = Depends(get_db)):
    """Get parser configuration."""
    # Get regions
    result = await db.execute(text("""
        SELECT id, name_en, name_ge, slug, enabled, display_order
        FROM regions
        ORDER BY display_order, name_en
    """))
    regions = [
        {
            "id": str(r[0]),
            "name_en": r[1],
            "name_ge": r[2],
            "slug": r[3],
            "enabled": r[4],
            "display_order": r[5],
        }
        for r in result.fetchall()
    ]

    # Get categories
    result = await db.execute(text("""
        SELECT id, name_en, name_ge, slug
        FROM categories
        ORDER BY name_en
    """))
    categories = [
        {
            "id": str(r[0]),
            "name_en": r[1],
            "name_ge": r[2],
            "slug": r[3],
        }
        for r in result.fetchall()
    ]

    return {
        "regions": regions,
        "categories": categories,
        "sources": ["jobs.ge"],
    }


@router.get("/batches")
async def get_batches(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """Get batch job history."""
    result = await db.execute(text("""
        SELECT
            id, status, config, mode,
            total_jobs, completed_jobs, failed_jobs,
            created_at, started_at, completed_at, triggered_by
        FROM parse_batches
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """), {"limit": limit, "offset": offset})

    batches = [{
        "id": str(r[0]),
        "status": r[1],
        "config": r[2],
        "mode": r[3],
        "jobs": {
            "total": r[4],
            "completed": r[5],
            "failed": r[6],
        },
        "timing": {
            "created_at": r[7].isoformat() if r[7] else None,
            "started_at": r[8].isoformat() if r[8] else None,
            "completed_at": r[9].isoformat() if r[9] else None,
        },
        "triggered_by": r[10],
    } for r in result.fetchall()]

    count_result = await db.execute(text("SELECT COUNT(*) FROM parse_batches"))
    total = count_result.scalar() or 0

    return {
        "batches": batches,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/batches/{batch_id}")
async def get_batch(
    batch_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get batch details with its jobs."""
    # Get batch
    result = await db.execute(text("""
        SELECT
            id, status, config, mode,
            total_jobs, completed_jobs, failed_jobs,
            created_at, started_at, completed_at, triggered_by
        FROM parse_batches
        WHERE id = :batch_id
    """), {"batch_id": batch_id})

    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Batch not found")

    batch = {
        "id": str(row[0]),
        "status": row[1],
        "config": row[2],
        "mode": row[3],
        "jobs": {
            "total": row[4],
            "completed": row[5],
            "failed": row[6],
        },
        "timing": {
            "created_at": row[7].isoformat() if row[7] else None,
            "started_at": row[8].isoformat() if row[8] else None,
            "completed_at": row[9].isoformat() if row[9] else None,
        },
        "triggered_by": row[10],
    }

    # Get jobs in this batch
    jobs_result = await db.execute(text("""
        SELECT
            id, job_type, source, status,
            target_region, target_category,
            processed_items, new_items, updated_items, skipped_items, failed_items,
            started_at, completed_at, error_message
        FROM parse_jobs
        WHERE batch_id = :batch_id
        ORDER BY created_at
    """), {"batch_id": batch_id})

    batch["parse_jobs"] = [{
        "id": str(r[0]),
        "job_type": r[1],
        "source": r[2],
        "status": r[3],
        "scope": {
            "region": r[4],
            "category": r[5],
        },
        "progress": {
            "processed": r[6] or 0,
            "new": r[7] or 0,
            "updated": r[8] or 0,
            "skipped": r[9] or 0,
            "failed": r[10] or 0,
        },
        "timing": {
            "started_at": r[11].isoformat() if r[11] else None,
            "completed_at": r[12].isoformat() if r[12] else None,
        },
        "error_message": r[13],
    } for r in jobs_result.fetchall()]

    return batch
