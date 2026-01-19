"""
Pytest configuration and fixtures for testing.
"""
import os
import pytest
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from src.infra.models import Base

# Check if we should use testcontainers (CI environment)
USE_TESTCONTAINERS = os.getenv("USE_TESTCONTAINERS", "false").lower() == "true"

# Conditionally import testcontainers
if USE_TESTCONTAINERS:
    from testcontainers.postgres import PostgresContainer


@pytest.fixture(scope="session")
def postgres_container():
    """
    Start a PostgreSQL container for tests.
    Only used when USE_TESTCONTAINERS is true.
    """
    if USE_TESTCONTAINERS:
        with PostgresContainer("postgres:15-alpine") as postgres:
            yield postgres
    else:
        yield None


@pytest.fixture
def database_url(postgres_container):
    """
    Get the database URL for tests.
    Uses testcontainers in CI or local test database otherwise.
    """
    if USE_TESTCONTAINERS and postgres_container:
        host = postgres_container.get_container_host_ip()
        port = postgres_container.get_exposed_port(5432)
        return f"postgresql+asyncpg://test:test@{host}:{port}/test"
    else:
        return os.getenv(
            "TEST_DATABASE_URL",
            "postgresql+asyncpg://postgres:postgres@localhost:5432/filadelfias_test"
        )


@pytest.fixture
async def engine(database_url):
    """
    Create a test database engine.
    Function scoped to ensure it runs in the same event loop as the test.
    """
    engine = create_async_engine(
        database_url,
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
