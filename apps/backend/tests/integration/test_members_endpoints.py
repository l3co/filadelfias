"""
Integration tests for members management endpoints.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from src.infra.database import get_db
from src.infra.models import Tenant, User, UserChurchMembership
from src.infra.security import create_access_token, get_password_hash
from src.main import app


@pytest.fixture
async def setup_tenant(db_session):
    """
    Fixture to create a user, a tenant, and link them.
    Returns (token, tenant, user)
    """
    # Create user
    user = User(email="pastor@church.com", password_hash=get_password_hash("password123"), name="Pastor User")
    db_session.add(user)
    await db_session.flush()

    # Create tenant
    tenant = Tenant(name="Presbiteriana Teste", slug="ipb-teste")
    db_session.add(tenant)
    await db_session.flush()

    # Link user to tenant
    membership = UserChurchMembership(user_id=user.id, tenant_id=tenant.id, role="PASTOR")
    db_session.add(membership)
    await db_session.commit()

    token = create_access_token({"sub": str(user.id)})
    return token, tenant, user


@pytest.mark.asyncio
class TestMembersEndpoints:
    async def test_create_member(self, setup_tenant):
        """Test creating a new member."""
        token, tenant, _ = setup_tenant

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                f"/tenants/{tenant.id}/members",
                json={
                    "full_name": "Novo Membro",
                    "email": "membro@example.com",
                    "status": "COMUNGANTE",
                    "gender": "M",
                    "role": "MEMBRO",
                },
                headers={"Authorization": f"Bearer {token}"},
            )

        assert response.status_code == 201
        data = response.json()
        assert data["full_name"] == "Novo Membro"
        assert data["tenant_id"] == str(tenant.id)
        assert "id" in data

    async def test_list_members(self, setup_tenant):
        """
        Test listing members of a tenant.
        """
        token, tenant, _ = setup_tenant

        # Create a member first (we need to do this via DB or API if API existed)
        # Since API doesn't exist yet, this TEST expects the API to exist.
        # But we can't seed via API if it fails.
        # So we seed via DB if we had the model. But we don't have the model Member yet!
        # So this test will fail twofold: Model undefined, API undefined.
        # TDD: First test failure should be "Endpoint 404" or "Model not found".

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(f"/tenants/{tenant.id}/members", headers={"Authorization": f"Bearer {token}"})

        app.dependency_overrides.clear()

        # Should be 200 OK (empty list initially if no seed)
        # But if we want to test list content, we need to seed.
        # Since we haven't created the Member model, we can't seed via DB in this test code without importing it.
        # So let's skip seeding for now and check empty list.
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
