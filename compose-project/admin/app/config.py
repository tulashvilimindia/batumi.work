"""Admin dashboard configuration.

Security Note: All sensitive configuration MUST come from environment variables.
Never commit default credentials to source code.
"""
import os
from typing import ClassVar


class Settings:
    """Application settings with secure defaults.

    All sensitive values are loaded from environment variables.
    The application will fail fast if required variables are missing.
    """

    # Required - no defaults for security
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # Non-sensitive defaults are OK
    BACKUP_DIR: str = os.getenv("BACKUP_DIR", "/backups")
    APP_NAME: ClassVar[str] = "Batumi.work Admin"
    VERSION: ClassVar[str] = "1.0.0"

    def __init__(self) -> None:
        """Validate required configuration on instantiation."""
        self._validate_required()

    def _validate_required(self) -> None:
        """Validate that all required environment variables are set.

        Raises:
            ValueError: If required environment variables are missing.
        """
        missing: list[str] = []

        if not self.DATABASE_URL:
            missing.append("DATABASE_URL")

        if missing:
            raise ValueError(
                f"Required environment variables not set: {', '.join(missing)}. "
                "Please configure these in your .env file or environment."
            )


settings = Settings()
