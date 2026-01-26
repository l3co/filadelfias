"""
Filadelfias API - Main Application Entry Point
"""

import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from src.api.auth import router as auth_router
from src.api.bible import router as bible_router
from src.api.churches import router as churches_router
from src.api.devotionals import router as devotionals_router
from src.api.ebd import router as ebd_router
from src.api.events import router as events_router
from src.api.financial import router as financial_router
from src.api.governance import router as governance_router
from src.api.hymnal import router as hymnal_router
from src.api.invitations import router as invitations_router
from src.api.manual import router as manual_router
from src.api.members import router as members_router
from src.api.memberships import router as memberships_router
from src.api.metadata import router as metadata_router
from src.api.mission import router as mission_router
from src.api.prayer import router as prayer_router
from src.api.tenants import router as tenants_router
from src.api.tithe import router as tithe_router
from src.config import settings
from src.middleware import LoggingMiddleware
from src.middleware.rate_limiter import limiter

app = FastAPI(
    title="Filadelfias API",
    description="Multi-tenant church management platform",
    version="0.1.0",
)

# Rate Limiter Configuration
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded errors."""
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
            "retry_after": exc.detail,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Custom handler for validation errors - logs details in DEBUG mode."""
    from src.services.logging_service import log_debug, log_warning

    errors = exc.errors()

    # Serialize errors to be JSON-safe (remove non-serializable objects like ValueError)
    def serialize_error(err: dict) -> dict:
        result = {}
        for k, v in err.items():
            if k == "ctx":
                # Skip context which may contain non-serializable objects
                continue
            elif isinstance(v, (str, int, float, bool, type(None))):
                result[k] = v
            elif isinstance(v, (list, tuple)):
                result[k] = [str(i) if not isinstance(i, (str, int)) else i for i in v]
            else:
                result[k] = str(v)
        return result

    serializable_errors = [serialize_error(e) for e in errors]

    # Always log validation errors as warning
    log_warning(
        "Validation error",
        path=request.url.path,
        method=request.method,
        error_count=len(errors),
    )

    # In DEBUG mode, log full details including request body
    if os.getenv("DEBUG", "").lower() in ("true", "1", "yes"):
        try:
            body = await request.body()
            body_str = body.decode("utf-8")[:1000]  # Limit to 1000 chars
        except Exception:
            body_str = "<unable to read body>"

        log_debug(
            "Validation error details",
            path=request.url.path,
            errors=serializable_errors,
            body_preview=body_str,
        )

    return JSONResponse(
        status_code=422,
        content={"detail": serializable_errors},
    )


# Logging Middleware (must be added first to wrap all requests)
app.add_middleware(LoggingMiddleware)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID", "X-Tenant-ID"],
    expose_headers=["X-Request-ID"],
    max_age=600,
)

# Include routers
app.include_router(auth_router)
app.include_router(members_router)
app.include_router(memberships_router)
app.include_router(tenants_router)
app.include_router(churches_router)
app.include_router(invitations_router)
app.include_router(bible_router)
app.include_router(hymnal_router)
app.include_router(governance_router)
app.include_router(financial_router)
app.include_router(mission_router)
app.include_router(ebd_router)
app.include_router(events_router)
app.include_router(prayer_router)
app.include_router(devotionals_router)
app.include_router(manual_router)
app.include_router(metadata_router)
app.include_router(tithe_router)


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.

    Returns:
        dict: Status of the API
    """
    return {"status": "healthy", "service": "filadelfias-api"}


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with API information.

    Returns:
        dict: Welcome message and documentation link
    """
    return {
        "message": "Filadelfias API",
        "docs": "/docs",
        "health": "/health",
    }
