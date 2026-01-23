"""Backups router - backup management.

Security Notes:
- Database credentials are passed via environment variables, never in command line
- Async subprocess is used to avoid blocking the event loop
- File paths are validated to prevent path traversal attacks
"""
import asyncio
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config import settings

router = APIRouter()

# Constants
BACKUP_TIMEOUT_SECONDS = 300  # 5 minutes
MIN_VALID_BACKUP_SIZE = 100  # bytes


def parse_database_url(db_url: str) -> Tuple[str, str, str, str, str]:
    """Parse database URL into components securely.

    Args:
        db_url: Database URL in format postgresql+asyncpg://user:pass@host:port/dbname

    Returns:
        Tuple of (user, password, host, port, dbname)

    Raises:
        HTTPException: If URL format is invalid
    """
    if "://" not in db_url:
        raise HTTPException(status_code=500, detail="Invalid DATABASE_URL format")

    try:
        # Remove driver prefix (postgresql+asyncpg://)
        url_part = db_url.split("://", 1)[1]

        # Split auth from host
        auth_part, host_part = url_part.rsplit("@", 1)

        # Parse auth (user:password)
        user, password = auth_part.split(":", 1)

        # Parse host and database
        host_port, dbname = host_part.split("/", 1)

        # Parse host and port
        if ":" in host_port:
            host, port = host_port.split(":", 1)
        else:
            host, port = host_port, "5432"

        return user, password, host, port, dbname

    except (ValueError, IndexError) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse DATABASE_URL: {str(e)}"
        )


async def run_pg_command(
    cmd_args: list[str],
    password: str,
    timeout: int = BACKUP_TIMEOUT_SECONDS,
    input_data: Optional[bytes] = None,
) -> Tuple[bytes, bytes, int]:
    """Run a PostgreSQL command asynchronously with secure password handling.

    Args:
        cmd_args: Command arguments (NOT shell string)
        password: Database password (passed via PGPASSWORD env var)
        timeout: Command timeout in seconds
        input_data: Optional input to send to stdin

    Returns:
        Tuple of (stdout, stderr, returncode)

    Raises:
        HTTPException: If command times out or fails
    """
    # Create environment with PGPASSWORD
    env = os.environ.copy()
    env["PGPASSWORD"] = password

    try:
        process = await asyncio.create_subprocess_exec(
            *cmd_args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            stdin=asyncio.subprocess.PIPE if input_data else None,
            env=env,
        )

        stdout, stderr = await asyncio.wait_for(
            process.communicate(input=input_data),
            timeout=timeout
        )

        return stdout, stderr, process.returncode or 0

    except asyncio.TimeoutError:
        process.kill()
        await process.wait()
        raise HTTPException(
            status_code=500,
            detail=f"Command timed out after {timeout} seconds"
        )


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
    """Create a manual backup.

    Creates a compressed PostgreSQL dump in the manual backups directory.
    Uses async subprocess to avoid blocking the event loop.
    Password is passed via PGPASSWORD environment variable for security.
    """
    backup_dir = Path(settings.BACKUP_DIR) / "manual"
    backup_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"manual_backup_{timestamp}.sql.gz"
    filepath = backup_dir / filename

    # Parse database URL securely
    user, password, host, port, dbname = parse_database_url(settings.DATABASE_URL)

    try:
        # Run pg_dump with arguments (not shell string) for security
        pg_dump_args = [
            "pg_dump",
            "-h", host,
            "-p", port,
            "-U", user,
            "-d", dbname,
            "--format=plain",
            "--no-owner",
            "--no-privileges",
        ]

        stdout, stderr, returncode = await run_pg_command(pg_dump_args, password)

        if returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Backup failed: {stderr.decode('utf-8', errors='replace')}"
            )

        # Compress and write to file using thread pool to avoid blocking
        def _write_gzip(path: Path, data: bytes) -> None:
            """Write gzipped data to file (blocking operation)."""
            import gzip
            with gzip.open(path, 'wb') as f:
                f.write(data)

        await asyncio.to_thread(_write_gzip, filepath, stdout)

        stat = filepath.stat()

        # Verify backup is not empty
        if stat.st_size < MIN_VALID_BACKUP_SIZE:
            filepath.unlink()
            raise HTTPException(
                status_code=500,
                detail="Backup failed: empty or corrupted backup file"
            )

        return {
            "success": True,
            "name": filename,
            "path": f"manual/{filename}",
            "size_mb": round(stat.st_size / (1024 * 1024), 2),
            "created_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Clean up partial file on error
        if filepath.exists():
            filepath.unlink()
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")


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


@router.delete("/{backup_type}/{filename}")
async def delete_backup(backup_type: str, filename: str):
    """Delete a backup file.

    Args:
        backup_type: One of "daily", "weekly", "manual"
        filename: Name of the backup file

    Security:
    - Validates backup_type against whitelist
    - Validates filename to prevent path traversal
    """
    valid_types = {"daily", "weekly", "manual"}
    if backup_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid backup type")

    # Validate filename to prevent path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    filepath = Path(settings.BACKUP_DIR) / backup_type / filename

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Backup not found")

    try:
        filepath.unlink()
        return {"success": True, "message": f"Deleted {filename}"}
    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied")
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete: {e.strerror}")


@router.post("/restore")
async def restore_backup(request: dict):
    """Restore database from a backup file.

    Request body: {"filename": "manual/backup_20260122_120000.sql.gz"}

    Security:
    - Validates file path to prevent directory traversal
    - Uses async subprocess to avoid blocking
    - Password passed via environment variable
    """
    backup_path = request.get("filename", "")
    if not backup_path:
        raise HTTPException(status_code=400, detail="filename is required")

    # Validate path to prevent directory traversal
    if ".." in backup_path or backup_path.startswith("/"):
        raise HTTPException(status_code=400, detail="Invalid backup path")

    # Parse backup path (e.g., "manual/backup_file.sql.gz")
    filepath = Path(settings.BACKUP_DIR) / backup_path

    # Ensure the resolved path is within BACKUP_DIR
    try:
        filepath = filepath.resolve()
        backup_base = Path(settings.BACKUP_DIR).resolve()
        if not str(filepath).startswith(str(backup_base)):
            raise HTTPException(status_code=400, detail="Invalid backup path")
    except (OSError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid backup path")

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Backup not found")

    if not str(filepath).endswith(".sql.gz"):
        raise HTTPException(status_code=400, detail="Invalid backup file format")

    # Parse database URL securely
    user, password, host, port, dbname = parse_database_url(settings.DATABASE_URL)

    try:
        # Read and decompress the backup file using thread pool to avoid blocking
        def _read_gzip(path: Path) -> bytes:
            """Read gzipped file (blocking operation)."""
            import gzip
            with gzip.open(path, 'rb') as f:
                return f.read()

        sql_data = await asyncio.to_thread(_read_gzip, filepath)

        # Run psql with input data
        psql_args = [
            "psql",
            "-h", host,
            "-p", port,
            "-U", user,
            "-d", dbname,
            "--quiet",
        ]

        stdout, stderr, returncode = await run_pg_command(
            psql_args,
            password,
            timeout=BACKUP_TIMEOUT_SECONDS * 2,  # Restore may take longer
            input_data=sql_data,
        )

        if returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Restore failed: {stderr.decode('utf-8', errors='replace')}"
            )

        return {
            "success": True,
            "message": f"Database restored from {backup_path}",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")
