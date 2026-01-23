"""
Filadelfias API - Main Application Entry Point
"""

from fastapi import FastAPI, Request
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
from src.api.mission import router as mission_router
from src.api.prayer import router as prayer_router
from src.api.tenants import router as tenants_router
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
