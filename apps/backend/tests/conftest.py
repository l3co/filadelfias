"""Pytest configuration for backend tests."""

import os
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from alembic.config import Config
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from testcontainers.postgres import PostgresContainer

from alembic import command


@pytest.fixture(scope="session")
def postgres_db() -> Generator[str, None, None]:
    existing_database_url = os.environ.get("DATABASE_URL")
    if existing_database_url:
        yield existing_database_url
        return

    print("🐘 Starting PostgreSQL container...")

    with PostgresContainer("postgres:16-alpine", dbname="filadelfias", username="postgres", password="postgres") as container:
        sync_url = container.get_connection_url()
        async_url = sync_url.replace("postgresql+psycopg2://", "postgresql+asyncpg://").replace(
            "postgresql://", "postgresql+asyncpg://"
        )

        os.environ["DATABASE_URL"] = async_url
        os.environ["ENVIRONMENT"] = "test"
        os.environ["SECRET_KEY"] = "test-secret-key"
        os.environ["DEBUG"] = "false"
        os.environ["CORS_ORIGINS_STR"] = "http://localhost:5173"

        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")

        yield async_url


@pytest_asyncio.fixture(scope="function", autouse=True)
async def clean_core_tables(request: pytest.FixtureRequest):
    if request.node.get_closest_marker("integration") is None:
        return

    postgres_db = request.getfixturevalue("postgres_db")
    engine = create_async_engine(postgres_db, pool_pre_ping=True)
    async with engine.begin() as conn:
        await conn.execute(text("DELETE FROM user_reading_progress"))
        await conn.execute(text("DELETE FROM reading_plans"))
        await conn.execute(text("DELETE FROM bible_highlights"))
        await conn.execute(text("DELETE FROM bible_notes"))
        await conn.execute(text("DELETE FROM bible_verses"))
        await conn.execute(text("DELETE FROM bible_chapters"))
        await conn.execute(text("DELETE FROM bible_books"))
        await conn.execute(text("DELETE FROM bible_versions"))
        await conn.execute(text("DELETE FROM ebd_comments"))
        await conn.execute(text("DELETE FROM ebd_lessons"))
        await conn.execute(text("DELETE FROM ebd_students"))
        await conn.execute(text("DELETE FROM ebd_classes"))
        await conn.execute(text("DELETE FROM meeting_votes"))
        await conn.execute(text("DELETE FROM meetings"))
        await conn.execute(text("DELETE FROM councils"))
        await conn.execute(text("DELETE FROM transactions"))
        await conn.execute(text("DELETE FROM transaction_categories"))
        await conn.execute(text("DELETE FROM financial_accounts"))
        await conn.execute(text("DELETE FROM tithe_records"))
        await conn.execute(text("DELETE FROM expense_requests"))
        await conn.execute(text("DELETE FROM missionaries"))
        await conn.execute(text("DELETE FROM countries"))
        await conn.execute(text("DELETE FROM devotionals"))
        await conn.execute(text("DELETE FROM prayer_requests"))
        await conn.execute(text("DELETE FROM events"))
        await conn.execute(text("DELETE FROM members"))
        await conn.execute(text("DELETE FROM memberships"))
        await conn.execute(text("DELETE FROM tenants"))
        await conn.execute(text("DELETE FROM users"))
    await engine.dispose()


@pytest_asyncio.fixture
async def client(postgres_db) -> AsyncGenerator[AsyncClient, None]:
    from src.main import app

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer test-token"}


@pytest_asyncio.fixture
async def registered_user(client: AsyncClient) -> dict:
    import uuid

    unique_id = uuid.uuid4().hex[:8]
    email = f"testuser_{unique_id}@test.com"

    await client.post("/auth/register", json={"email": email, "name": "Test User", "password": "S3cureP@ssword!"})

    login_resp = await client.post("/auth/login", data={"username": email, "password": "S3cureP@ssword!"})
    token = login_resp.json()["access_token"]

    me_resp = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    user_data = me_resp.json()

    return {
        "id": user_data["id"],
        "email": email,
        "name": "Test User",
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest_asyncio.fixture
async def tenant_with_admin(client: AsyncClient, registered_user: dict) -> dict:
    import uuid

    unique_slug = f"test-church-{uuid.uuid4().hex[:8]}"

    resp = await client.post(
        "/tenants", json={"name": "Test Church", "slug": unique_slug}, headers=registered_user["headers"]
    )
    tenant_data = resp.json()

    return {
        "tenant": tenant_data,
        "tenant_id": tenant_data["id"],
        "user": registered_user,
        "headers": registered_user["headers"],
    }


@pytest_asyncio.fixture
async def member_in_tenant(client: AsyncClient, tenant_with_admin: dict) -> dict:
    tenant_id = tenant_with_admin["tenant_id"]
    headers = tenant_with_admin["headers"]

    resp = await client.post(
        f"/tenants/{tenant_id}/members",
        json={
            "full_name": "Membro Teste",
            "email": "membro@test.com",
            "status": "COMUNGANTE",
            "gender": "M",
            "office": "MEMBRO",
        },
        headers=headers,
    )
    member_data = resp.json()

    return {
        "member": member_data,
        "member_id": member_data["id"],
        **tenant_with_admin,
    }
