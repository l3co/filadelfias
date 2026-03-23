"""
Async SQLAlchemy engine and session management.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from src.config import settings

engine_kwargs = {
    "echo": False,
    "pool_pre_ping": True,
}

# Tests run the app and DB access inside short-lived event loops, so pooled
# asyncpg connections can end up bound to a different loop between requests.
if settings.environment == "test":
    engine_kwargs["poolclass"] = NullPool

engine = create_async_engine(
    settings.database_url,
    **engine_kwargs,
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


def init_engine():
    return engine
