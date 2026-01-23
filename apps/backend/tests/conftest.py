"""
Pytest configuration and fixtures for testing with Firestore Emulator via Testcontainers.
"""

import os
from typing import AsyncGenerator, Generator

import pytest
from httpx import ASGITransport, AsyncClient
from testcontainers.core.container import DockerContainer
from testcontainers.core.waiting_utils import wait_for_logs

# Define constants for emulator
FIRESTORE_PORT = 8080
PROJECT_ID = "filadelfias-test"


@pytest.fixture(scope="session")
def firestore_emulator() -> Generator[str, None, None]:
    """
    Start Firestore Emulator using Testcontainers.
    Returns the host:port string.
    """
    # Use the official Google Cloud SDK image which includes emulators
    # or a lighter image specifically for Firestore.
    # 'mtlynch/firestore-emulator' is a popular lightweight option.
    print("🐳 Starting Firestore Emulator container...")

    with DockerContainer("mtlynch/firestore-emulator:latest") as container:
        container.with_exposed_ports(FIRESTORE_PORT)
        container.with_env("FIRESTORE_PROJECT_ID", PROJECT_ID)
        container.with_env("PORT", str(FIRESTORE_PORT))

        container.start()

        # Wait for emulator to be ready
        wait_for_logs(container, "Dev App Server is now running")

        host = container.get_container_host_ip()
        port = container.get_exposed_port(FIRESTORE_PORT)
        emulator_host = f"{host}:{port}"

        print(f"✅ Firestore Emulator running at {emulator_host}")

        # Set environment variables for the application to pick up
        # IMPORTANT: These must be set before importing app/firebase modules
        os.environ["FIRESTORE_EMULATOR_HOST"] = emulator_host
        os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "mock-auth-host:9099"  # Placeholder
        os.environ["ENVIRONMENT"] = "test"
        os.environ["PROJECT_ID"] = PROJECT_ID

        yield emulator_host


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test session."""
    import asyncio

    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def clean_firestore(firestore_emulator):
    """
    Clean Firestore emulator between tests.
    Uses the emulator's REST API to delete all data.
    """
    # The emulator exposes an endpoint to clear data
    # DELETE http://{host}:{port}/emulator/v1/projects/{project_id}/databases/(default)/documents
    url = f"http://{firestore_emulator}/emulator/v1/projects/{PROJECT_ID}/databases/(default)/documents"

    async with AsyncClient() as client:
        try:
            resp = await client.delete(url)
            if resp.status_code != 200:
                print(f"⚠️ Failed to clear Firestore: {resp.status_code}")
        except Exception as e:
            print(f"⚠️ Error clearing Firestore: {e}")


@pytest.fixture
async def client(firestore_emulator) -> AsyncGenerator[AsyncClient, None]:
    """
    Async HTTP client for integration tests.
    """
    # Import app inside fixture to ensure env vars are set mainly for FIRESTORE_EMULATOR_HOST
    from src.main import app

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
def auth_headers():
    """
    Returns valid authorization headers for a test user.
    Simulates a decode_access_token success without needing real Auth Emulator login
    (unless we are testing the auth flow specifically).

    For integration tests that hit the API, you might need to mock 'decode_access_token'
    or actually create a user in the Auth Emulator.
    """
    # Placeholder for a predefined token if we mock the verifier
    return {"Authorization": "Bearer test-token"}


# =============================================================================
# SHARED FIXTURES FOR INTEGRATION TESTS
# =============================================================================

@pytest.fixture
async def registered_user(client: AsyncClient) -> dict:
    """
    Register a new user and return user data with token.
    Returns dict with: id, email, name, token, headers
    """
    import uuid
    unique_id = uuid.uuid4().hex[:8]
    email = f"testuser_{unique_id}@test.com"

    # Register
    await client.post(
        "/auth/register",
        json={"email": email, "name": "Test User", "password": "password123"}
    )

    # Login to get token
    login_resp = await client.post(
        "/auth/login",
        data={"username": email, "password": "password123"}
    )
    token = login_resp.json()["access_token"]

    # Get user info
    me_resp = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    user_data = me_resp.json()

    return {
        "id": user_data["id"],
        "email": email,
        "name": "Test User",
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest.fixture
async def tenant_with_admin(client: AsyncClient, registered_user: dict) -> dict:
    """
    Create a tenant with the registered user as admin.
    Returns dict with: tenant (id, name, slug), user, headers
    """
    import uuid
    unique_slug = f"test-church-{uuid.uuid4().hex[:8]}"

    resp = await client.post(
        "/tenants",
        json={"name": "Test Church", "slug": unique_slug},
        headers=registered_user["headers"]
    )
    tenant_data = resp.json()

    return {
        "tenant": tenant_data,
        "tenant_id": tenant_data["id"],
        "user": registered_user,
        "headers": registered_user["headers"],
    }


@pytest.fixture
async def member_in_tenant(client: AsyncClient, tenant_with_admin: dict) -> dict:
    """
    Create a member within the tenant.
    Returns dict with: member, tenant, user, headers
    """
    tenant_id = tenant_with_admin["tenant_id"]
    headers = tenant_with_admin["headers"]

    resp = await client.post(
        f"/tenants/{tenant_id}/members",
        json={
            "full_name": "Membro Teste",
            "email": "membro@test.com",
            "status": "COMUNGANTE",
            "gender": "M",
            "role": "MEMBRO",
        },
        headers=headers
    )
    member_data = resp.json()

    return {
        "member": member_data,
        "member_id": member_data["id"],
        **tenant_with_admin,
    }
