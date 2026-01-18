"""
Integration tests for authentication endpoints.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app
from src.infra.database import get_db


@pytest.mark.asyncio
class TestAuthEndpoints:
    """Test authentication API endpoints."""
    
    async def test_register_new_user(self, db_session, override_get_db):
        """
        Test user registration endpoint.
        """
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post(
                "/auth/register",
                json={
                    "email": "newuser@example.com",
                    "name": "New User",
                    "password": "password123"
                }
            )
        
        app.dependency_overrides.clear()
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["name"] == "New User"
        assert "id" in data
        assert "password" not in data
        assert "password_hash" not in data
    
    async def test_register_duplicate_email(self, db_session, override_get_db):
        """
        Test that registering with duplicate email fails.
        """
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            # Register first user
            await client.post(
                "/auth/register",
                json={
                    "email": "duplicate@example.com",
                    "name": "First User",
                    "password": "password123"
                }
            )
            
            # Try to register second user with same email
            response = await client.post(
                "/auth/register",
                json={
                    "email": "duplicate@example.com",
                    "name": "Second User",
                    "password": "password456"
                }
            )
        
        app.dependency_overrides.clear()
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    async def test_login_success(self, db_session, override_get_db):
        """
        Test successful login.
        """
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            # Register user
            await client.post(
                "/auth/register",
                json={
                    "email": "login@example.com",
                    "name": "Login User",
                    "password": "password123"
                }
            )
            
            # Login
            response = await client.post(
                "/auth/login",
                data={
                    "username": "login@example.com",
                    "password": "password123"
                }
            )
        
        app.dependency_overrides.clear()
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    async def test_login_wrong_password(self, db_session, override_get_db):
        """
        Test login with wrong password fails.
        """
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            # Register user
            await client.post(
                "/auth/register",
                json={
                    "email": "wrongpass@example.com",
                    "name": "Wrong Pass User",
                    "password": "correctpassword"
                }
            )
            
            # Try to login with wrong password
            response = await client.post(
                "/auth/login",
                data={
                    "username": "wrongpass@example.com",
                    "password": "wrongpassword"
                }
            )
        
        app.dependency_overrides.clear()
        
        assert response.status_code == 401
    
    async def test_get_current_user(self, db_session, override_get_db):
        """
        Test getting current user profile with valid token.
        """
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            # Register user
            await client.post(
                "/auth/register",
                json={
                    "email": "getme@example.com",
                    "name": "Get Me User",
                    "password": "password123"
                }
            )
            
            # Login to get token
            login_response = await client.post(
                "/auth/login",
                data={
                    "username": "getme@example.com",
                    "password": "password123"
                }
            )
            token = login_response.json()["access_token"]
            
            # Get current user
            response = await client.get(
                "/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            )
        
        app.dependency_overrides.clear()
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "getme@example.com"
        assert data["name"] == "Get Me User"
    
    async def test_get_current_user_without_token(self, db_session, override_get_db):
        """
        Test that accessing /me without token fails.
        """
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.get("/auth/me")
        
        app.dependency_overrides.clear()
        
        assert response.status_code == 401
