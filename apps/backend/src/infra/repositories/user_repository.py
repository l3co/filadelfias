"""
User repository for Firestore.
"""

from datetime import datetime
from typing import Optional

from src.infra.firestore_repository import FirestoreRepository
from src.infra.security import get_password_hash


class UserRepository(FirestoreRepository):
    """Repository for users collection."""

    def __init__(self):
        super().__init__("users")

    async def get_by_email(self, email: str) -> Optional[dict]:
        """Get user by email."""
        return await self.get_by_field("email", email)

    async def get_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID."""
        return await self.get(user_id)

    async def exists_by_email(self, email: str) -> bool:
        """Check if user exists by email."""
        user = await self.get_by_email(email)
        return user is not None

    async def get_by_reset_token(self, token: str) -> Optional[dict]:
        """Get user by password reset token."""
        users = await self.query("password_reset_token", "==", token, limit=1)
        if users and users[0].get("password_reset_expires"):
            expires = users[0]["password_reset_expires"]
            if isinstance(expires, datetime) and expires > datetime.utcnow():
                return users[0]
        return None

    async def create_user(self, email: str, name: str, password: str, avatar_url: Optional[str] = None) -> dict:
        """Create a new user with hashed password."""
        data = {
            "email": email,
            "password_hash": get_password_hash(password),
            "name": name,
            "avatar_url": avatar_url,
            "is_active": True,
            "must_change_password": False,
            "password_reset_token": None,
            "password_reset_expires": None,
            "memberships": [],
        }
        return await self.create(data)

    async def set_password_reset_token(self, user_id: str, token: str, expires: datetime) -> Optional[dict]:
        """Set password reset token for user."""
        return await self.update(
            user_id,
            {
                "password_reset_token": token,
                "password_reset_expires": expires,
            },
        )

    async def clear_password_reset_token(self, user_id: str) -> Optional[dict]:
        """Clear password reset token."""
        return await self.update(
            user_id,
            {
                "password_reset_token": None,
                "password_reset_expires": None,
            },
        )

    async def update_password(self, user_id: str, password_hash: str) -> Optional[dict]:
        """Update user password."""
        return await self.update(
            user_id,
            {
                "password_hash": password_hash,
                "must_change_password": False,
                "password_reset_token": None,
                "password_reset_expires": None,
            },
        )


# Singleton instance
user_repository = UserRepository()
