"""
Structured logging service for observability.

Provides:
- JSON structured logs for Cloud Logging
- Request context (request_id, user_id, tenant_id)
- Performance timing
- Error tracking with stack traces
"""

import json
import logging
import os
import sys
import time
import uuid
from contextvars import ContextVar
from functools import wraps
from typing import Any, Callable, Optional

# Context variables for request tracking
request_id_var: ContextVar[str] = ContextVar("request_id", default="")
user_id_var: ContextVar[str] = ContextVar("user_id", default="")
tenant_id_var: ContextVar[str] = ContextVar("tenant_id", default="")


class StructuredFormatter(logging.Formatter):
    """JSON formatter for structured logging compatible with Cloud Logging."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "severity": record.levelname,
            "message": record.getMessage(),
            "timestamp": self.formatTime(record),
            "logger": record.name,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add context if available
        if request_id := request_id_var.get():
            log_entry["request_id"] = request_id
        if user_id := user_id_var.get():
            log_entry["user_id"] = user_id
        if tenant_id := tenant_id_var.get():
            log_entry["tenant_id"] = tenant_id

        # Add extra fields
        if hasattr(record, "extra_data"):
            log_entry["data"] = record.extra_data

        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def setup_logging(level: str = "INFO") -> logging.Logger:
    """Configure structured logging for the application."""
    logger = logging.getLogger("filadelfias")
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Remove existing handlers
    logger.handlers.clear()

    # Add structured handler for stdout
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())
    logger.addHandler(handler)

    return logger


# Global logger instance - use DEBUG level if DEBUG env var is set
_log_level = "DEBUG" if os.getenv("DEBUG", "").lower() in ("true", "1", "yes") else "INFO"
logger = setup_logging(_log_level)


def get_logger(name: str = "filadelfias") -> logging.Logger:
    """Get a logger instance with the given name."""
    return logging.getLogger(name)


def set_request_context(
    request_id: Optional[str] = None,
    user_id: Optional[str] = None,
    tenant_id: Optional[str] = None,
) -> None:
    """Set context variables for the current request."""
    if request_id:
        request_id_var.set(request_id)
    if user_id:
        user_id_var.set(user_id)
    if tenant_id:
        tenant_id_var.set(tenant_id)


def clear_request_context() -> None:
    """Clear all context variables."""
    request_id_var.set("")
    user_id_var.set("")
    tenant_id_var.set("")


def generate_request_id() -> str:
    """Generate a unique request ID."""
    return str(uuid.uuid4())[:8]


# Sensitive keys to mask in logs
SENSITIVE_KEYS = ("password", "token", "secret", "key", "authorization", "auth", "credential", "pass")


def sanitize_data(data: Any) -> Any:
    """Recursively mask sensitive data in dictionaries and lists."""
    if isinstance(data, dict):
        return {
            k: "*****" if any(s in k.lower() for s in SENSITIVE_KEYS) else sanitize_data(v) for k, v in data.items()
        }
    if isinstance(data, list):
        return [sanitize_data(i) for i in data]
    return data


def log_with_data(level: str, message: str, **data: Any) -> None:
    """Log a message with additional structured data (sanitized)."""
    # Sanitize data before logging
    clean_data = sanitize_data(data)

    record = logger.makeRecord(
        logger.name,
        getattr(logging, level.upper()),
        "",
        0,
        message,
        (),
        None,
    )
    record.extra_data = clean_data
    logger.handle(record)


def log_info(message: str, **data: Any) -> None:
    """Log info message with optional data."""
    if data:
        log_with_data("INFO", message, **data)
    else:
        logger.info(message)


def log_warning(message: str, **data: Any) -> None:
    """Log warning message with optional data."""
    if data:
        log_with_data("WARNING", message, **data)
    else:
        logger.warning(message)


def log_error(message: str, **data: Any) -> None:
    """Log error message with optional data."""
    if data:
        log_with_data("ERROR", message, **data)
    else:
        logger.error(message)


def log_debug(message: str, **data: Any) -> None:
    """Log debug message with optional data."""
    if data:
        log_with_data("DEBUG", message, **data)
    else:
        logger.debug(message)


def timed(func: Callable) -> Callable:
    """Decorator to log function execution time."""

    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = await func(*args, **kwargs)
            elapsed = (time.perf_counter() - start) * 1000
            log_info(
                f"{func.__name__} completed",
                function=func.__name__,
                duration_ms=round(elapsed, 2),
            )
            return result
        except Exception as e:
            elapsed = (time.perf_counter() - start) * 1000
            log_error(
                f"{func.__name__} failed",
                function=func.__name__,
                duration_ms=round(elapsed, 2),
                error=str(e),
            )
            raise

    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            elapsed = (time.perf_counter() - start) * 1000
            log_info(
                f"{func.__name__} completed",
                function=func.__name__,
                duration_ms=round(elapsed, 2),
            )
            return result
        except Exception as e:
            elapsed = (time.perf_counter() - start) * 1000
            log_error(
                f"{func.__name__} failed",
                function=func.__name__,
                duration_ms=round(elapsed, 2),
                error=str(e),
            )
            raise

    import asyncio

    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    return sync_wrapper
