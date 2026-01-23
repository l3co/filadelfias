"""
Integration tests for tenants (churches) endpoints.
"""

import uuid

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def get_auth_token(client: AsyncClient, email: str = None):
    """Helper to register and login a user."""
    if email is None:
        email = f"user_{uuid.uuid4().hex[:8]}@test.com"
    await client.post(
        "/auth/register",
        json={"email": email, "name": "Test User", "password": "password123"}
    )
    response = await client.post(
        "/auth/login",
        data={"username": email, "password": "password123"}
    )
    return response.json()["access_token"]


@pytest.mark.asyncio
class TestTenantsEndpoints:
    """Test tenants API endpoints."""

    async def test_create_tenant_success(self, client: AsyncClient):
        """Test creating a new tenant."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        slug = f"ipb-teste-{uuid.uuid4().hex[:8]}"

        response = await client.post(
            "/tenants",
            json={"name": "Igreja Presbiteriana Teste", "slug": slug},
            headers=headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Igreja Presbiteriana Teste"
        assert data["slug"] == slug
        assert "id" in data

    async def test_create_tenant_duplicate_slug(self, client: AsyncClient):
        """Test that creating tenant with duplicate slug fails."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        slug = f"duplicate-{uuid.uuid4().hex[:8]}"

        # Create first tenant
        await client.post(
            "/tenants",
            json={"name": "First Church", "slug": slug},
            headers=headers
        )

        # Try to create second tenant with same slug
        response = await client.post(
            "/tenants",
            json={"name": "Second Church", "slug": slug},
            headers=headers
        )

        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    async def test_create_tenant_requires_auth(self, client: AsyncClient):
        """Test that creating tenant requires authentication."""
        response = await client.post(
            "/tenants",
            json={"name": "No Auth Church", "slug": "no-auth"}
        )

        assert response.status_code == 401

    async def test_update_tenant_as_admin(self, client: AsyncClient):
        """Test updating tenant as admin."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        slug = f"update-{uuid.uuid4().hex[:8]}"

        # Create tenant (creator is admin)
        create_resp = await client.post(
            "/tenants",
            json={"name": "Update Test Church", "slug": slug},
            headers=headers
        )
        tenant_id = create_resp.json()["id"]

        # Update tenant
        response = await client.patch(
            f"/tenants/{tenant_id}",
            json={
                "name": "Updated Church Name",
                "city": "São Paulo",
                "state": "SP"
            },
            headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Church Name"
        assert data["city"] == "São Paulo"
        assert data["state"] == "SP"

    async def test_update_tenant_non_admin_forbidden(self, client: AsyncClient):
        """Test that non-admin cannot update tenant."""
        # Create tenant with first user (admin)
        admin_token = await get_auth_token(client)
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        slug = f"admin-only-{uuid.uuid4().hex[:8]}"

        create_resp = await client.post(
            "/tenants",
            json={"name": "Admin Only Church", "slug": slug},
            headers=admin_headers
        )
        tenant_id = create_resp.json()["id"]

        # Try to update with different user (non-admin)
        other_token = await get_auth_token(client)
        other_headers = {"Authorization": f"Bearer {other_token}"}

        response = await client.patch(
            f"/tenants/{tenant_id}",
            json={"name": "Hacked Name"},
            headers=other_headers
        )

        assert response.status_code == 403

    async def test_update_tenant_not_found(self, client: AsyncClient):
        """Test updating non-existent tenant returns 404."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        response = await client.patch(
            "/tenants/nonexistent-id",
            json={"name": "New Name"},
            headers=headers
        )

        assert response.status_code == 404

    async def test_delete_tenant_as_admin(self, client: AsyncClient):
        """Test deleting tenant as admin."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        slug = f"to-delete-{uuid.uuid4().hex[:8]}"

        # Create tenant
        create_resp = await client.post(
            "/tenants",
            json={"name": "To Delete Church", "slug": slug},
            headers=headers
        )
        tenant_id = create_resp.json()["id"]

        # Delete tenant
        response = await client.delete(
            f"/tenants/{tenant_id}",
            headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "excluídos" in data["message"] or "deleted" in data["message"].lower()
        assert "deleted" in data

    async def test_delete_tenant_non_admin_forbidden(self, client: AsyncClient):
        """Test that non-admin cannot delete tenant."""
        # Create tenant with admin
        admin_token = await get_auth_token(client)
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        slug = f"protected-{uuid.uuid4().hex[:8]}"

        create_resp = await client.post(
            "/tenants",
            json={"name": "Protected Church", "slug": slug},
            headers=admin_headers
        )
        tenant_id = create_resp.json()["id"]

        # Try to delete with different user
        other_token = await get_auth_token(client)
        other_headers = {"Authorization": f"Bearer {other_token}"}

        response = await client.delete(
            f"/tenants/{tenant_id}",
            headers=other_headers
        )

        assert response.status_code == 403

    async def test_delete_tenant_not_found(self, client: AsyncClient):
        """Test deleting non-existent tenant returns 404."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        response = await client.delete(
            "/tenants/nonexistent-id",
            headers=headers
        )

        assert response.status_code == 404


@pytest.mark.asyncio
class TestTenantValidation:
    """Test tenant input validation."""

    async def test_create_tenant_name_too_short(self, client: AsyncClient):
        """Test that tenant name must be at least 2 characters."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        response = await client.post(
            "/tenants",
            json={"name": "A", "slug": "valid-slug"},
            headers=headers
        )

        assert response.status_code == 422

    async def test_create_tenant_slug_too_short(self, client: AsyncClient):
        """Test that tenant slug must be at least 2 characters."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        response = await client.post(
            "/tenants",
            json={"name": "Valid Name", "slug": "a"},
            headers=headers
        )

        assert response.status_code == 422

    async def test_create_tenant_missing_name(self, client: AsyncClient):
        """Test that tenant name is required."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        response = await client.post(
            "/tenants",
            json={"slug": "valid-slug"},
            headers=headers
        )

        assert response.status_code == 422

    async def test_create_tenant_missing_slug(self, client: AsyncClient):
        """Test that tenant slug is required."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        response = await client.post(
            "/tenants",
            json={"name": "Valid Name"},
            headers=headers
        )

        assert response.status_code == 422
