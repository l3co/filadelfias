"""
Unit tests for security utilities (password hashing and JWT).
"""
from datetime import timedelta

from src.infra.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)


class TestPasswordHashing:
    """Test password hashing functions."""

    def test_password_hash_is_different_from_plain(self):
        """
        Test that hashed password is different from plain password.
        """
        plain_password = "mysecretpassword123"
        hashed = get_password_hash(plain_password)

        assert hashed != plain_password
        assert len(hashed) > 0

    def test_verify_correct_password(self):
        """
        Test that correct password verification returns True.
        """
        plain_password = "mysecretpassword123"
        hashed = get_password_hash(plain_password)

        assert verify_password(plain_password, hashed) is True

    def test_verify_incorrect_password(self):
        """
        Test that incorrect password verification returns False.
        """
        plain_password = "mysecretpassword123"
        wrong_password = "wrongpassword"
        hashed = get_password_hash(plain_password)

        assert verify_password(wrong_password, hashed) is False

    def test_same_password_different_hashes(self):
        """
        Test that same password generates different hashes (salt).
        """
        plain_password = "mysecretpassword123"
        hash1 = get_password_hash(plain_password)
        hash2 = get_password_hash(plain_password)

        assert hash1 != hash2
        assert verify_password(plain_password, hash1) is True
        assert verify_password(plain_password, hash2) is True


class TestJWTTokens:
    """Test JWT token creation and decoding."""

    def test_create_access_token(self):
        """
        Test that access token is created successfully.
        """
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data)

        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_valid_token(self):
        """
        Test that valid token is decoded correctly.
        """
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data)

        decoded = decode_access_token(token)

        assert decoded is not None
        assert decoded["sub"] == "user123"
        assert decoded["email"] == "test@example.com"
        assert "exp" in decoded

    def test_decode_invalid_token(self):
        """
        Test that invalid token returns None.
        """
        invalid_token = "invalid.token.here"
        decoded = decode_access_token(invalid_token)

        assert decoded is None

    def test_token_with_custom_expiration(self):
        """
        Test token creation with custom expiration time.
        """
        data = {"sub": "user123"}
        expires_delta = timedelta(minutes=60)
        token = create_access_token(data, expires_delta=expires_delta)

        decoded = decode_access_token(token)

        assert decoded is not None
        assert decoded["sub"] == "user123"
