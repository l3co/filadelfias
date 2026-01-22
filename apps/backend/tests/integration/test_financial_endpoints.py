"""
Integration tests for financial endpoints.
"""

import pytest
import uuid
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def get_auth_token(client: AsyncClient):
    """Helper to register and login a user."""
    email = f"user_{uuid.uuid4().hex[:8]}@test.com"
    await client.post("/auth/register", json={"email": email, "name": "Test User", "password": "password123"})
    response = await client.post("/auth/login", data={"username": email, "password": "password123"})
    return response.json()["access_token"]


async def create_tenant(client: AsyncClient, token: str):
    """Helper to create a tenant."""
    slug = f"church-{uuid.uuid4().hex[:8]}"
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.post("/tenants", json={"name": "Test Church", "slug": slug}, headers=headers)
    return response.json()


@pytest.mark.asyncio
class TestFinancialEndpoints:
    """Test financial API endpoints."""

    async def test_create_account(self, client: AsyncClient):
        """Test creating a new financial account."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # 1. Create Account
        acc_resp = await client.post(
            "/financial/accounts",
            params={"tenant_id": tenant_id},
            json={"name": "Banco do Brasil", "type": "BANK", "balance": 1000.0},
            headers=headers,
        )
        assert acc_resp.status_code == 200
        account = acc_resp.json()
        assert account["balance"] == 1000.0

        # 2. Create Category
        cat_resp = await client.post(
            "/financial/categories",
            params={"tenant_id": tenant_id},
            json={"name": "Dízimos", "type": "INCOME"},
            headers=headers,
        )
        assert cat_resp.status_code == 200
        category = cat_resp.json()

        # 3. Create Transaction (Income)
        trans_resp = await client.post(
            "/financial/transactions",
            params={"tenant_id": tenant_id},
            json={
                "account_id": account["id"],
                "category_id": category["id"],
                "amount": 500.0,
                "type": "CREDIT",
                "description": "Dízimo Teste",
                "date": "2023-11-01",
            },
            headers=headers,
        )
        assert trans_resp.status_code == 200

        # 4. Verify accounts list works
        acc_list_resp = await client.get("/financial/accounts", params={"tenant_id": tenant_id}, headers=headers)
        accounts = acc_list_resp.json()
        assert len(accounts) >= 1
        assert accounts[0]["name"] == "Banco do Brasil"
