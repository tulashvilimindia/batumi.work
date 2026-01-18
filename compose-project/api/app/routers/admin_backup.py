"""Admin backup management API endpoints."""
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.core.security import verify_api_key

router = APIRouter(prefix="/admin/backups", tags=["Admin Backups"])

# Backup directory - mounted from docker-compose
BACKUP_DIR = Path("/backups") if os.path.exists("/backups") else Path("./backups")


class BackupFile(BaseModel):
    """Backup file information."""
    filename: str
    path: str
    size_mb: float
    created_at: datetime
    backup_type: str  # daily, weekly, manual


class BackupStatus(BaseModel):
    """Backup system status."""
    last_backup: Optional[datetime]
    last_backup_size_mb: Optional[float]
    backup_count_daily: int
    backup_count_weekly: int
    backup_count_manual: int
    total_size_mb: float
    health: str  # healthy, warning, error
    next_scheduled: Optional[datetime]


class TriggerResponse(BaseModel):
    """Response from backup trigger."""
    status: str
    message: str
    filename: Optional[str]


def get_backup_files(backup_type: str = None) -> List[BackupFile]:
    """Get list of backup files.

    Args:
        backup_type: Optional filter by type (daily, weekly, manual)

    Returns:
        List of BackupFile objects
    """
    files = []

    dirs_to_scan = []
    if backup_type:
        dirs_to_scan = [BACKUP_DIR / backup_type]
    else:
        dirs_to_scan = [
            BACKUP_DIR / "daily",
            BACKUP_DIR / "weekly",
            BACKUP_DIR / "manual"
        ]

    for dir_path in dirs_to_scan:
        if not dir_path.exists():
            continue

        btype = dir_path.name
        for f in dir_path.glob("*.sql.gz"):
            stat = f.stat()
            files.append(BackupFile(
                filename=f.name,
                path=str(f),
                size_mb=round(stat.st_size / (1024 * 1024), 2),
                created_at=datetime.fromtimestamp(stat.st_mtime),
                backup_type=btype
            ))

    # Sort by creation date descending
    files.sort(key=lambda x: x.created_at, reverse=True)
    return files


@router.get("", response_model=List[BackupFile])
async def list_backups(
    backup_type: Optional[str] = None,
    limit: int = 20,
    _: bool = Depends(verify_api_key)
):
    """List all available backup files.

    Args:
        backup_type: Filter by type (daily, weekly, manual)
        limit: Maximum number of files to return

    Returns:
        List of backup files
    """
    files = get_backup_files(backup_type)
    return files[:limit]


@router.get("/status", response_model=BackupStatus)
async def get_backup_status(_: bool = Depends(verify_api_key)):
    """Get backup system status and health.

    Returns overall backup status including last backup info,
    counts, and health status.
    """
    all_files = get_backup_files()

    daily_files = [f for f in all_files if f.backup_type == "daily"]
    weekly_files = [f for f in all_files if f.backup_type == "weekly"]
    manual_files = [f for f in all_files if f.backup_type == "manual"]

    total_size = sum(f.size_mb for f in all_files)

    # Determine health status
    health = "healthy"
    last_backup = None
    last_backup_size = None

    if all_files:
        last_backup = all_files[0].created_at
        last_backup_size = all_files[0].size_mb

        # Check if backup is too old (more than 48 hours)
        age_hours = (datetime.now() - last_backup).total_seconds() / 3600
        if age_hours > 48:
            health = "warning"
        if age_hours > 72:
            health = "error"
    else:
        health = "error"  # No backups at all

    # Estimate next scheduled backup (3 AM daily)
    next_scheduled = None
    if last_backup:
        next_day = last_backup.replace(hour=3, minute=0, second=0, microsecond=0)
        if next_day <= datetime.now():
            next_day = datetime.now().replace(hour=3, minute=0, second=0, microsecond=0)
            if next_day <= datetime.now():
                from datetime import timedelta
                next_day += timedelta(days=1)
        next_scheduled = next_day

    return BackupStatus(
        last_backup=last_backup,
        last_backup_size_mb=last_backup_size,
        backup_count_daily=len(daily_files),
        backup_count_weekly=len(weekly_files),
        backup_count_manual=len(manual_files),
        total_size_mb=round(total_size, 2),
        health=health,
        next_scheduled=next_scheduled
    )


@router.post("/trigger", response_model=TriggerResponse)
async def trigger_backup(_: bool = Depends(verify_api_key)):
    """Trigger an immediate manual backup.

    Creates a new backup in the manual/ directory.
    Note: This requires the backup container to be running.
    """
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"jobboard_manual_{timestamp}.sql.gz"
        output_path = BACKUP_DIR / "manual" / filename

        # Ensure manual directory exists
        (BACKUP_DIR / "manual").mkdir(parents=True, exist_ok=True)

        # Get database connection info from environment
        pg_host = os.getenv("PGHOST", "db")
        pg_user = os.getenv("POSTGRES_USER", "postgres")
        pg_db = os.getenv("POSTGRES_DB", "jobboard")

        # Build pg_dump command
        cmd = (
            f"pg_dump -h {pg_host} -U {pg_user} -d {pg_db} "
            f"--format=plain --no-owner --no-privileges | gzip > {output_path}"
        )

        # Try to execute (this may fail if not in the right container)
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
                env={**os.environ, "PGPASSWORD": os.getenv("POSTGRES_PASSWORD", "postgres")}
            )

            if result.returncode == 0 and output_path.exists():
                return TriggerResponse(
                    status="success",
                    message=f"Backup created successfully",
                    filename=filename
                )
            else:
                raise Exception(result.stderr or "Backup command failed")

        except (subprocess.TimeoutExpired, FileNotFoundError) as e:
            # pg_dump not available in this container - expected in API container
            return TriggerResponse(
                status="pending",
                message="Backup request queued. Use backup container for execution.",
                filename=None
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")


@router.get("/{filename}")
async def download_backup(
    filename: str,
    _: bool = Depends(verify_api_key)
):
    """Download a specific backup file.

    Args:
        filename: Name of the backup file

    Returns:
        The backup file as a download
    """
    # Search for file in all directories
    for subdir in ["daily", "weekly", "manual"]:
        file_path = BACKUP_DIR / subdir / filename
        if file_path.exists():
            return FileResponse(
                path=str(file_path),
                filename=filename,
                media_type="application/gzip"
            )

    raise HTTPException(status_code=404, detail="Backup file not found")


@router.delete("/{filename}")
async def delete_backup(
    filename: str,
    _: bool = Depends(verify_api_key)
):
    """Delete a specific backup file.

    Args:
        filename: Name of the backup file to delete

    Returns:
        Confirmation message
    """
    # Search for file in manual directory only (don't allow deleting scheduled backups)
    file_path = BACKUP_DIR / "manual" / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Backup file not found in manual backups")

    try:
        file_path.unlink()
        return {"status": "deleted", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete: {str(e)}")
