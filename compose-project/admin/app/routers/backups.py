"""Backups router - backup management."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from datetime import datetime
import subprocess
import os

from app.config import settings

router = APIRouter()


@router.get("")
async def list_backups():
    """List all backups."""
    backup_dir = Path(settings.BACKUP_DIR)

    if not backup_dir.exists():
        return {"backups": [], "total": 0}

    backups = []
    for subdir in ["daily", "weekly", "manual"]:
        dir_path = backup_dir / subdir
        if dir_path.exists():
            for f in dir_path.glob("*.sql.gz"):
                stat = f.stat()
                backups.append({
                    "name": f.name,
                    "path": str(f.relative_to(backup_dir)),
                    "type": subdir,
                    "size_mb": round(stat.st_size / (1024 * 1024), 2),
                    "created_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                })

    # Sort by date descending
    backups.sort(key=lambda x: x["created_at"], reverse=True)

    return {
        "backups": backups,
        "total": len(backups),
    }


@router.get("/status")
async def get_backup_status():
    """Get backup health status."""
    backup_dir = Path(settings.BACKUP_DIR)

    if not backup_dir.exists():
        return {
            "health": "warning",
            "message": "Backup directory not found",
            "count": 0,
        }

    backups = list(backup_dir.rglob("*.sql.gz"))

    if not backups:
        return {
            "health": "warning",
            "message": "No backups found",
            "count": 0,
        }

    # Find latest backup
    latest = max(backups, key=lambda f: f.stat().st_mtime)
    age_hours = (datetime.now() - datetime.fromtimestamp(latest.stat().st_mtime)).total_seconds() / 3600

    health = "healthy"
    message = "Backups OK"
    if age_hours > 48:
        health = "warning"
        message = "Latest backup is more than 48 hours old"
    if age_hours > 72:
        health = "critical"
        message = "Latest backup is more than 72 hours old"

    # Calculate total size
    total_size = sum(f.stat().st_size for f in backups)

    return {
        "health": health,
        "message": message,
        "count": len(backups),
        "latest": {
            "name": latest.name,
            "created_at": datetime.fromtimestamp(latest.stat().st_mtime).isoformat(),
            "age_hours": round(age_hours, 1),
            "size_mb": round(latest.stat().st_size / (1024 * 1024), 2),
        },
        "total_size_mb": round(total_size / (1024 * 1024), 2),
    }


@router.post("")
async def create_backup():
    """Create a manual backup."""
    backup_dir = Path(settings.BACKUP_DIR) / "manual"
    backup_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"manual_backup_{timestamp}.sql.gz"
    filepath = backup_dir / filename

    # Get database connection info from environment
    db_url = settings.DATABASE_URL
    # Parse postgresql+asyncpg://user:pass@host:port/dbname
    if "://" in db_url:
        parts = db_url.split("://")[1]
        auth, hostdb = parts.split("@")
        user, password = auth.split(":")
        hostport, dbname = hostdb.split("/")
        host, port = hostport.split(":") if ":" in hostport else (hostport, "5432")
    else:
        raise HTTPException(status_code=500, detail="Invalid DATABASE_URL")

    try:
        # Run pg_dump with pipefail to catch pg_dump errors
        cmd = f"set -o pipefail && PGPASSWORD={password} pg_dump -h {host} -p {port} -U {user} -d {dbname} | gzip > {filepath}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, executable='/bin/bash')

        if result.returncode != 0:
            # Clean up empty file if created
            if filepath.exists():
                filepath.unlink()
            raise HTTPException(status_code=500, detail=f"Backup failed: {result.stderr}")

        stat = filepath.stat()

        # Verify backup is not empty (minimum 100 bytes for a valid gzipped SQL)
        if stat.st_size < 100:
            filepath.unlink()
            raise HTTPException(status_code=500, detail="Backup failed: empty or corrupted backup file")

        return {
            "success": True,
            "name": filename,
            "path": f"manual/{filename}",
            "size_mb": round(stat.st_size / (1024 * 1024), 2),
            "created_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{backup_type}/{filename}")
async def download_backup(backup_type: str, filename: str):
    """Download a backup file."""
    if backup_type not in ["daily", "weekly", "manual"]:
        raise HTTPException(status_code=400, detail="Invalid backup type")

    filepath = Path(settings.BACKUP_DIR) / backup_type / filename

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Backup not found")

    return FileResponse(
        path=str(filepath),
        filename=filename,
        media_type="application/gzip",
    )
