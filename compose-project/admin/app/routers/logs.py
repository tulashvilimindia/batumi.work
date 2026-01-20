"""Logs router - container log viewer."""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter()

# Try to import docker, but don't fail if not available
try:
    import docker
    docker_client = docker.from_env()
    DOCKER_AVAILABLE = True
except Exception:
    DOCKER_AVAILABLE = False
    docker_client = None


CONTAINER_NAMES = {
    "api": "jobboard-api",
    "db": "jobboard-db",
    "web": "jobboard-web",
    "worker": "jobboard-worker",
    "admin": "jobboard-admin",
}


@router.get("/services")
async def list_services():
    """List available services for log viewing."""
    if not DOCKER_AVAILABLE:
        return {
            "available": False,
            "message": "Docker not available",
            "services": [],
        }

    services = []
    for name, container_name in CONTAINER_NAMES.items():
        try:
            container = docker_client.containers.get(container_name)
            services.append({
                "name": name,
                "container": container_name,
                "status": container.status,
                "running": container.status == "running",
            })
        except Exception:
            services.append({
                "name": name,
                "container": container_name,
                "status": "not found",
                "running": False,
            })

    return {
        "available": True,
        "services": services,
    }


@router.get("/{service}")
async def get_logs(
    service: str,
    tail: int = Query(100, ge=1, le=1000),
    since: Optional[str] = None,
):
    """Get container logs."""
    if not DOCKER_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Docker not available"
        )

    if service not in CONTAINER_NAMES:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown service: {service}. Available: {list(CONTAINER_NAMES.keys())}"
        )

    container_name = CONTAINER_NAMES[service]

    try:
        container = docker_client.containers.get(container_name)

        kwargs = {
            "tail": tail,
            "timestamps": True,
        }
        if since:
            kwargs["since"] = since

        logs = container.logs(**kwargs).decode("utf-8", errors="replace")

        # Split into lines
        lines = logs.strip().split("\n") if logs.strip() else []

        return {
            "service": service,
            "container": container_name,
            "status": container.status,
            "lines": lines,
            "count": len(lines),
        }

    except docker.errors.NotFound:
        raise HTTPException(
            status_code=404,
            detail=f"Container {container_name} not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
