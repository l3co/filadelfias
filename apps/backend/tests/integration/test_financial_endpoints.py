"""
Integration tests for financial endpoints.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from src.infra.database import get_db
from src.main import app


@pytest.mark.asyncio
class TestFinancialEndpoints:
    """Test financial API endpoints."""

    async def get_auth_token(self, client, email="fin_user@test.com"):
        """Helper to register and login a user."""
        try:
            await client.post(
                "/auth/register", json={"email": email, "name": "Financial User", "password": "password123"}
            )
        except Exception:
            pass

        response = await client.post("/auth/login", data={"username": email, "password": "password123"})
        return response.json()["access_token"]

    async def create_tenant(self, client, token, slug="fin-church"):
        """Helper to create a tenant."""
        headers = {"Authorization": f"Bearer {token}"}
        # Check if exists (simplification) - just post, if 400 assume exists but we need ID...
        # Let's just create unique slug
        response = await client.post("/tenants", json={"name": "Financial Church", "slug": slug}, headers=headers)
        return response.json()

    async def test_financial_flow(self, db_session, override_get_db):
        """
        Test Account -> Category -> Transaction flow.
        """
        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            token = await self.get_auth_token(client, "ceo@bank.com")
            headers = {"Authorization": f"Bearer {token}"}
            tenant = await self.create_tenant(client, token, "bank-church")
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

            # 4. Check Balance Update (Not implemented in API response immediate, but next Ledger check)
            # Actually Repository logic update balance?
            # Let's check account listing
            acc_list_resp = await client.get("/financial/accounts", params={"tenant_id": tenant_id}, headers=headers)
            updated_account = acc_list_resp.json()[0]
            # 1000 + 500 = 1500
            assert updated_account["balance"] == 1500.0

        app.dependency_overrides.clear()
