"""Parser adapters package."""
from app.parsers.jobs_ge import JobsGeAdapter
from app.parsers.hr_ge import HrGeAdapter

# Registry of available adapters
ADAPTERS = {
    "jobs.ge": JobsGeAdapter,
    "hr.ge": HrGeAdapter,
}

__all__ = ["JobsGeAdapter", "HrGeAdapter", "ADAPTERS"]
