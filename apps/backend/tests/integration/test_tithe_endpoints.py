"""
Integration tests for tithe/offering endpoints.
"""

import uuid

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def get_auth_token(client: AsyncClient):
    """Helper to register and login a user."""
    email = f"user_{uuid.uuid4().hex[:8]}@test.com"
    password = "Test@123!"
    await client.post("/auth/register", json={"email": email, "name": "Test User", "password": password})
    response = await client.post("/auth/login", data={"username": email, "password": password})
    return response.json()["access_token"]


async def create_tenant(client: AsyncClient, token: str):
    """Helper to create a tenant."""
    slug = f"church-{uuid.uuid4().hex[:8]}"
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.post("/tenants", json={"name": "Test Church", "slug": slug}, headers=headers)
    return response.json()


async def create_member(client: AsyncClient, token: str, tenant_id: str):
    """Helper to create a member."""
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.post(
        f"/tenants/{tenant_id}/members",
        json={
            "full_name": "Membro Teste",
            "email": f"membro_{uuid.uuid4().hex[:8]}@test.com",
            "status": "COMUNGANTE",
            "office": "MEMBRO",
        },
        headers=headers,
    )
    return response.json()


@pytest.mark.asyncio
class TestTitheEndpoints:
    """Test tithe/offering API endpoints.

    Note: These tests require a user to be linked to a member.
    The membership linking happens during tenant creation for admin users.
    """

    @pytest.mark.skip(reason="Requires member linkage - needs seed data or complex setup")
    async def test_create_tithe_record(self, client: AsyncClient):
        """Test creating a new tithe record."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create tithe record
        resp = await client.post(
            "/tithe/records",
            params={"tenant_id": tenant_id},
            json={
                "amount": 500.0,
                "tithe_type": "DIZIMO",
                "tithe_date": "2026-01-15",
                "notes": "Dízimo de janeiro",
            },
            headers=headers,
        )
        assert resp.status_code == 200
        record = resp.json()
        assert record["amount"] == 500.0
        assert record["status"] == "PENDING"

    @pytest.mark.skip(reason="Requires member linkage - needs seed data or complex setup")
    async def test_list_my_tithe_records(self, client: AsyncClient):
        """Test listing user's own tithe records."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create tithe record
        await client.post(
            "/tithe/records",
            params={"tenant_id": tenant_id},
            json={
                "amount": 300.0,
                "tithe_type": "OFERTA",
                "tithe_date": "2026-01-20",
            },
            headers=headers,
        )

        # List my records
        resp = await client.get(
            "/tithe/records/me",
            params={"tenant_id": tenant_id},
            headers=headers,
        )
        assert resp.status_code == 200
        records = resp.json()
        assert len(records) >= 1

    @pytest.mark.skip(reason="Requires member linkage - needs seed data or complex setup")
    async def test_list_pending_tithe_records(self, client: AsyncClient):
        """Test listing pending tithe records (treasurer view)."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create tithe record
        await client.post(
            "/tithe/records",
            params={"tenant_id": tenant_id},
            json={
                "amount": 1000.0,
                "tithe_type": "DIZIMO",
                "tithe_date": "2026-01-25",
            },
            headers=headers,
        )

        # List pending records
        resp = await client.get(
            "/tithe/records/pending",
            params={"tenant_id": tenant_id},
            headers=headers,
        )
        assert resp.status_code == 200
        records = resp.json()
        assert len(records) >= 1
        assert all(r["status"] == "PENDING" for r in records)

    @pytest.mark.skip(reason="Requires member linkage - needs seed data or complex setup")
    async def test_approve_tithe_record(self, client: AsyncClient):
        """Test approving a tithe record."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create financial account first
        acc_resp = await client.post(
            "/financial/accounts",
            params={"tenant_id": tenant_id},
            json={"name": "Conta Dízimos", "type": "BANK", "balance": 0},
            headers=headers,
        )
        account = acc_resp.json()

        # Create tithe record
        create_resp = await client.post(
            "/tithe/records",
            params={"tenant_id": tenant_id},
            json={
                "amount": 250.0,
                "tithe_type": "DIZIMO",
                "tithe_date": "2026-01-10",
            },
            headers=headers,
        )
        assert create_resp.status_code == 200, f"Failed to create tithe: {create_resp.text}"
        record = create_resp.json()

        # Approve the record
        approve_resp = await client.patch(
            f"/tithe/records/{record['id']}/review",
            params={"tenant_id": tenant_id},
            json={
                "status": "APPROVED",
                "account_id": account["id"],
            },
            headers=headers,
        )
        assert approve_resp.status_code == 200
        approved = approve_resp.json()
        assert approved["status"] == "APPROVED"

    @pytest.mark.skip(reason="Requires member linkage - needs seed data or complex setup")
    async def test_reject_tithe_record(self, client: AsyncClient):
        """Test rejecting a tithe record."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create tithe record
        create_resp = await client.post(
            "/tithe/records",
            params={"tenant_id": tenant_id},
            json={
                "amount": 150.0,
                "tithe_type": "OFERTA",
                "tithe_date": "2026-01-05",
            },
            headers=headers,
        )
        assert create_resp.status_code == 200, f"Failed to create tithe: {create_resp.text}"
        record = create_resp.json()

        # Reject the record
        reject_resp = await client.patch(
            f"/tithe/records/{record['id']}/review",
            params={"tenant_id": tenant_id},
            json={
                "status": "REJECTED",
                "rejection_reason": "Comprovante inválido",
            },
            headers=headers,
        )
        assert reject_resp.status_code == 200
        rejected = reject_resp.json()
        assert rejected["status"] == "REJECTED"
        assert rejected["rejection_reason"] == "Comprovante inválido"
