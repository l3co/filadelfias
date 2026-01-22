"""
Unit tests for email service.
Uses mocking to test without actual email sending.
"""

import pytest

pytestmark = pytest.mark.unit
from unittest.mock import AsyncMock, MagicMock, patch

from src.services.email_service import EmailService


class TestEmailServiceConfiguration:
    """Test email service configuration."""

    def test_is_configured_with_api_key(self):
        """Service should be configured when API key is present."""
        with patch.dict("os.environ", {"RESEND_API_KEY": "test-api-key"}):
            service = EmailService()
            assert service.is_configured() is True

    def test_is_configured_without_api_key(self):
        """Service should NOT be configured when API key is missing."""
        with patch.dict("os.environ", {"RESEND_API_KEY": ""}, clear=True):
            service = EmailService()
            assert service.is_configured() is False

    def test_default_from_email(self):
        """Service should have default from email."""
        with patch.dict("os.environ", {}, clear=True):
            service = EmailService()
            assert "Filadélfias" in service.from_email
            assert "noreply" in service.from_email

    def test_custom_from_email(self):
        """Service should use custom from email when provided."""
        with patch.dict("os.environ", {"EMAIL_FROM": "custom@test.com"}):
            service = EmailService()
            assert service.from_email == "custom@test.com"

    def test_default_frontend_url(self):
        """Service should have default frontend URL."""
        with patch.dict("os.environ", {}, clear=True):
            service = EmailService()
            assert "localhost" in service.frontend_url

    def test_custom_frontend_url(self):
        """Service should use custom frontend URL when provided."""
        with patch.dict("os.environ", {"FRONTEND_URL": "https://app.filadelfias.com"}):
            service = EmailService()
            assert service.frontend_url == "https://app.filadelfias.com"


class TestSendWelcomeEmail:
    """Test welcome email functionality."""

    @pytest.mark.asyncio
    async def test_send_welcome_email_not_configured(self):
        """Should return False when service is not configured."""
        with patch.dict("os.environ", {"RESEND_API_KEY": ""}, clear=True):
            service = EmailService()
            result = await service.send_welcome_email(
                to_email="test@test.com",
                member_name="Test User",
                church_name="Test Church",
                temporary_password="ABC123"
            )
            assert result is False

    @pytest.mark.asyncio
    async def test_send_welcome_email_success(self):
        """Should return True when email is sent successfully."""
        with patch.dict("os.environ", {"RESEND_API_KEY": "test-key"}):
            service = EmailService()
            
            with patch("resend.Emails.send") as mock_send:
                mock_send.return_value = {"id": "test-email-id"}
                
                result = await service.send_welcome_email(
                    to_email="test@test.com",
                    member_name="Test User",
                    church_name="Test Church",
                    temporary_password="ABC123"
                )
                
                assert result is True
                mock_send.assert_called_once()
                
                # Check email content
                call_args = mock_send.call_args[0][0]
                assert call_args["to"] == ["test@test.com"]
                assert "Test Church" in call_args["subject"]
                assert "ABC123" in call_args["html"]
                assert "Test User" in call_args["html"]

    @pytest.mark.asyncio
    async def test_send_welcome_email_error(self):
        """Should return False when email sending fails."""
        with patch.dict("os.environ", {"RESEND_API_KEY": "test-key"}):
            service = EmailService()
            
            with patch("resend.Emails.send") as mock_send:
                mock_send.side_effect = Exception("API Error")
                
                result = await service.send_welcome_email(
                    to_email="test@test.com",
                    member_name="Test User",
                    church_name="Test Church",
                    temporary_password="ABC123"
                )
                
                assert result is False


class TestSendPasswordResetEmail:
    """Test password reset email functionality."""

    @pytest.mark.asyncio
    async def test_send_password_reset_not_configured(self):
        """Should return False when service is not configured."""
        with patch.dict("os.environ", {"RESEND_API_KEY": ""}, clear=True):
            service = EmailService()
            result = await service.send_password_reset_email(
                to_email="test@test.com",
                user_name="Test User",
                reset_token="abc123token"
            )
            assert result is False

    @pytest.mark.asyncio
    async def test_send_password_reset_success(self):
        """Should return True when email is sent successfully."""
        with patch.dict("os.environ", {
            "RESEND_API_KEY": "test-key",
            "FRONTEND_URL": "https://app.test.com"
        }):
            service = EmailService()
            
            with patch("resend.Emails.send") as mock_send:
                mock_send.return_value = {"id": "test-email-id"}
                
                result = await service.send_password_reset_email(
                    to_email="test@test.com",
                    user_name="Test User",
                    reset_token="abc123token"
                )
                
                assert result is True
                mock_send.assert_called_once()
                
                # Check email content
                call_args = mock_send.call_args[0][0]
                assert call_args["to"] == ["test@test.com"]
                assert "Redefinir" in call_args["subject"]
                assert "abc123token" in call_args["html"]
                assert "https://app.test.com/reset-password" in call_args["html"]

    @pytest.mark.asyncio
    async def test_send_password_reset_error(self):
        """Should return False when email sending fails."""
        with patch.dict("os.environ", {"RESEND_API_KEY": "test-key"}):
            service = EmailService()
            
            with patch("resend.Emails.send") as mock_send:
                mock_send.side_effect = Exception("API Error")
                
                result = await service.send_password_reset_email(
                    to_email="test@test.com",
                    user_name="Test User",
                    reset_token="abc123token"
                )
                
                assert result is False


class TestEmailContent:
    """Test email HTML content generation."""

    @pytest.mark.asyncio
    async def test_welcome_email_contains_required_elements(self):
        """Welcome email should contain all required elements."""
        with patch.dict("os.environ", {"RESEND_API_KEY": "test-key"}):
            service = EmailService()
            
            with patch("resend.Emails.send") as mock_send:
                mock_send.return_value = {"id": "test"}
                
                await service.send_welcome_email(
                    to_email="member@church.com",
                    member_name="João Silva",
                    church_name="Igreja Presbiteriana",
                    temporary_password="TEMP1234"
                )
                
                html_content = mock_send.call_args[0][0]["html"]
                
                # Check required content
                assert "João Silva" in html_content
                assert "Igreja Presbiteriana" in html_content
                assert "TEMP1234" in html_content
                assert "member@church.com" in html_content
                assert "Bem-vindo" in html_content
                assert "trocar sua senha" in html_content.lower() or "change" in html_content.lower()

    @pytest.mark.asyncio
    async def test_reset_email_contains_required_elements(self):
        """Reset email should contain all required elements."""
        with patch.dict("os.environ", {
            "RESEND_API_KEY": "test-key",
            "FRONTEND_URL": "https://app.filadelfias.com"
        }):
            service = EmailService()
            
            with patch("resend.Emails.send") as mock_send:
                mock_send.return_value = {"id": "test"}
                
                await service.send_password_reset_email(
                    to_email="user@test.com",
                    user_name="Maria Santos",
                    reset_token="secure-token-123"
                )
                
                html_content = mock_send.call_args[0][0]["html"]
                
                # Check required content
                assert "Maria Santos" in html_content
                assert "secure-token-123" in html_content
                assert "https://app.filadelfias.com/reset-password" in html_content
                assert "1 hora" in html_content or "expira" in html_content.lower()
