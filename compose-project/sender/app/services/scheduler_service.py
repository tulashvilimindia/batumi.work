"""Business hours scheduling service."""
from datetime import datetime, timedelta
from typing import Optional
import pytz

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Georgian timezone
GEORGIA_TZ = pytz.timezone("Asia/Tbilisi")


class SchedulerService:
    """Handles business hours logic and scheduling."""

    @staticmethod
    def get_georgia_time() -> datetime:
        """Get current time in Georgian timezone."""
        return datetime.now(GEORGIA_TZ)

    @staticmethod
    def is_business_hours(dt: Optional[datetime] = None) -> bool:
        """Check if given time (or now) is within business hours.

        Business hours: 9 AM - 9 PM Georgian time (UTC+4)
        """
        if dt is None:
            dt = SchedulerService.get_georgia_time()
        elif dt.tzinfo is None:
            dt = GEORGIA_TZ.localize(dt)
        else:
            dt = dt.astimezone(GEORGIA_TZ)

        hour = dt.hour
        return settings.BUSINESS_HOURS_START <= hour < settings.BUSINESS_HOURS_END

    @staticmethod
    def get_next_business_hour() -> datetime:
        """Get the next available business hour start time.

        If currently within business hours, returns now.
        Otherwise, returns next 9 AM Georgian time.
        """
        now = SchedulerService.get_georgia_time()

        if SchedulerService.is_business_hours(now):
            return now

        # Calculate next 9 AM
        next_start = now.replace(
            hour=settings.BUSINESS_HOURS_START,
            minute=0,
            second=0,
            microsecond=0,
        )

        # If current time is past today's business hours, schedule for tomorrow
        if now.hour >= settings.BUSINESS_HOURS_END:
            next_start += timedelta(days=1)

        logger.debug(
            "scheduling_for_business_hours",
            current_time=now.isoformat(),
            scheduled_time=next_start.isoformat(),
        )

        return next_start

    @staticmethod
    def calculate_scheduled_time(priority: int = 0) -> Optional[datetime]:
        """Calculate when a message should be sent based on business hours.

        Args:
            priority: Higher priority messages get sent first

        Returns:
            Scheduled datetime or None if can send immediately
        """
        if SchedulerService.is_business_hours():
            return None  # Can send immediately

        return SchedulerService.get_next_business_hour()

    @staticmethod
    def time_until_business_hours() -> Optional[timedelta]:
        """Get time remaining until business hours start.

        Returns None if currently within business hours.
        """
        if SchedulerService.is_business_hours():
            return None

        next_start = SchedulerService.get_next_business_hour()
        now = SchedulerService.get_georgia_time()
        return next_start - now

    @staticmethod
    def get_business_hours_status() -> dict:
        """Get current business hours status for API response."""
        now = SchedulerService.get_georgia_time()
        is_open = SchedulerService.is_business_hours(now)
        time_until = SchedulerService.time_until_business_hours()

        return {
            "current_time_georgia": now.isoformat(),
            "is_business_hours": is_open,
            "business_hours": f"{settings.BUSINESS_HOURS_START}:00 - {settings.BUSINESS_HOURS_END}:00 (UTC+4)",
            "next_open": (
                SchedulerService.get_next_business_hour().isoformat()
                if not is_open
                else None
            ),
            "time_until_open_seconds": (
                int(time_until.total_seconds()) if time_until else None
            ),
        }
