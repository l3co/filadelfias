"""
Database connection and session management.
"""

import ssl

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.config import settings


def _get_connect_args() -> dict:
    """Get connection args for asyncpg, including SSL for production databases."""
    # Digital Ocean and other cloud providers require SSL
    if "digitalocean" in settings.database_url or "ondigitalocean" in settings.database_url:
        # Create SSL context that doesn't verify certificates (DO managed DBs)
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        return {"ssl": ssl_context}
    return {}


# Create async engine
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
    connect_args=_get_connect_args(),
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """
    Dependency for getting async database session.

    Yields:
        AsyncSession: Database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
