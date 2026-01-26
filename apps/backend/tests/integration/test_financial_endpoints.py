"""
Integration tests for financial endpoints.
"""

import uuid

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def get_auth_token(client: AsyncClient):
    """Helper to register and login a user."""
    email = f"user_{uuid.uuid4().hex[:8]}@test.com"
    password = "Test@123!"  # Meets password requirements
    await client.post("/auth/register", json={"email": email, "name": "Test User", "password": password})
    response = await client.post("/auth/login", data={"username": email, "password": password})
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

    async def test_list_transactions_with_pagination(self, client: AsyncClient):
        """Test listing transactions with pagination."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create account
        acc_resp = await client.post(
            "/financial/accounts",
            params={"tenant_id": tenant_id},
            json={"name": "Conta Teste", "type": "BANK", "balance": 0},
            headers=headers,
        )
        account = acc_resp.json()

        # Create multiple transactions
        for i in range(15):
            await client.post(
                "/financial/transactions",
                params={"tenant_id": tenant_id},
                json={
                    "account_id": account["id"],
                    "amount": 100.0 + i,
                    "type": "CREDIT",
                    "description": f"Transação {i}",
                    "date": "2026-01-15",
                },
                headers=headers,
            )

        # Test pagination - page 1
        resp_page1 = await client.get(
            "/financial/transactions",
            params={"tenant_id": tenant_id, "page": 1, "page_size": 10},
            headers=headers,
        )
        assert resp_page1.status_code == 200
        page1_data = resp_page1.json()
        assert len(page1_data) == 10

        # Test pagination - page 2
        resp_page2 = await client.get(
            "/financial/transactions",
            params={"tenant_id": tenant_id, "page": 2, "page_size": 10},
            headers=headers,
        )
        assert resp_page2.status_code == 200
        page2_data = resp_page2.json()
        assert len(page2_data) == 5

    async def test_list_transactions_with_month_filter(self, client: AsyncClient):
        """Test listing transactions filtered by month."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create account
        acc_resp = await client.post(
            "/financial/accounts",
            params={"tenant_id": tenant_id},
            json={"name": "Conta Filtro", "type": "BANK", "balance": 0},
            headers=headers,
        )
        account = acc_resp.json()

        # Create transactions in different months
        await client.post(
            "/financial/transactions",
            params={"tenant_id": tenant_id},
            json={
                "account_id": account["id"],
                "amount": 100.0,
                "type": "CREDIT",
                "description": "Janeiro",
                "date": "2026-01-15",
            },
            headers=headers,
        )
        await client.post(
            "/financial/transactions",
            params={"tenant_id": tenant_id},
            json={
                "account_id": account["id"],
                "amount": 200.0,
                "type": "CREDIT",
                "description": "Fevereiro",
                "date": "2026-02-15",
            },
            headers=headers,
        )

        # Filter by January
        resp_jan = await client.get(
            "/financial/transactions",
            params={"tenant_id": tenant_id, "month": 1, "year": 2026},
            headers=headers,
        )
        assert resp_jan.status_code == 200
        jan_data = resp_jan.json()
        assert len(jan_data) == 1
        assert jan_data[0]["description"] == "Janeiro"

        # Filter by February
        resp_feb = await client.get(
            "/financial/transactions",
            params={"tenant_id": tenant_id, "month": 2, "year": 2026},
            headers=headers,
        )
        assert resp_feb.status_code == 200
        feb_data = resp_feb.json()
        assert len(feb_data) == 1
        assert feb_data[0]["description"] == "Fevereiro"
