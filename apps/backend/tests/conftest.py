"""
Pytest configuration and fixtures for testing.
"""
import pytest
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from src.infra.models import Base

# Test database URL
TEST_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/filadelfias_test"


@pytest.fixture
async def engine():
    """
    Create a test database engine.
    Function scoped to ensure it runs in the same event loop as the test.
    """
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        poolclass=NullPool,
    )
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    """
    Create a fresh database session for each test.
    This session runs in a transaction that rolls back after user.
    """
    connection = await engine.connect()
    transaction = await connection.begin()
    
    session_maker = async_sessionmaker(
        bind=connection,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    session = session_maker()
    
    yield session
    
    await session.close()
    await transaction.rollback()
    await connection.close()


@pytest.fixture
def override_get_db(db_session):
    """
    Override the get_db dependency for testing.
    """
    async def _override_get_db():
        yield db_session
    
    return _override_get_db
