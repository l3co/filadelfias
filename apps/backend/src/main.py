"""
Filadelfias API - Main Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.auth import router as auth_router
from src.api.members import router as members_router

app = FastAPI(
    title="Filadelfias API",
    description="Multi-tenant church management platform",
    version="0.1.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(members_router)


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
