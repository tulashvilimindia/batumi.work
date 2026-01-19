"""Structured logging configuration using structlog.

This module provides a centralized logging configuration for the application.
It outputs JSON logs for production and optionally human-readable logs for development.
"""
import logging
import sys
import structlog
from typing import Any


def configure_logging(
    log_level: str = "INFO",
    json_output: bool = True,
    add_request_id: bool = True,
) -> None:
    """Configure structured logging for the application.

    Args:
        log_level: Minimum log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        json_output: If True, output JSON logs. If False, output human-readable format.
        add_request_id: If True, include request_id processor for request tracking
    """
    # Set stdlib logging level
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, log_level.upper(), logging.INFO),
    )

    # Build processor chain
    shared_processors: list[Any] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    if json_output:
        # JSON output for production
        shared_processors.append(structlog.processors.JSONRenderer())
    else:
        # Human-readable output for development
        shared_processors.append(
            structlog.dev.ConsoleRenderer(
                colors=True,
                exception_formatter=structlog.dev.plain_traceback,
            )
        )

    structlog.configure(
        processors=shared_processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    """Get a configured logger instance.

    Args:
        name: Optional logger name. If not provided, caller's module name is used.

    Returns:
        A configured structlog logger instance.

    Usage:
        logger = get_logger(__name__)
        logger.info("event_name", key="value", count=42)
    """
    return structlog.get_logger(name)


def bind_request_context(request_id: str, **kwargs) -> None:
    """Bind request context to all subsequent log messages.

    Args:
        request_id: Unique request identifier
        **kwargs: Additional context to bind (e.g., user_id, path)

    Usage:
        bind_request_context(request_id="abc123", path="/api/v1/jobs")
        logger.info("processing_request")  # Will include request_id and path
    """
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        request_id=request_id,
        **kwargs,
    )


def clear_request_context() -> None:
    """Clear request context after request completes."""
    structlog.contextvars.clear_contextvars()


# Convenience logger for quick imports
logger = get_logger()
