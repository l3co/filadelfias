"""
Email service using Resend.
"""

import os

import resend


from src.services.logging_service import log_error, log_info, log_warning


class EmailService:
    """Service for sending emails via Resend."""

    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        self.from_email = os.getenv("EMAIL_FROM", "Filadélfias <noreply@filadelfias.app>")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

        if self.api_key:
            resend.api_key = self.api_key

    def is_configured(self) -> bool:
        """Check if email service is properly configured."""
        return bool(self.api_key)

    async def send_welcome_email(
        self, to_email: str, member_name: str, church_name: str, temporary_password: str
    ) -> bool:
        """
        Send welcome email with temporary password to new member.

        Args:
            to_email: Recipient email
            member_name: Name of the member
            church_name: Name of the church
            temporary_password: Generated temporary password

        Returns:
            True if email was sent successfully
        """
        if not self.is_configured():
            log_warning("Email service not configured - skipping welcome email", to_email=to_email)
            return False

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }}
                .password-box {{ background: #fff; border: 2px dashed #059669; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
                .password {{ font-size: 24px; font-weight: bold; color: #059669; letter-spacing: 2px; font-family: monospace; }}
                .button {{ display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
                .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🎉 Bem-vindo(a) ao Filadélfias!</h1>
                </div>
                <div class="content">
                    <p>Olá, <strong>{member_name}</strong>!</p>

                    <p>Você foi adicionado(a) como membro da <strong>{church_name}</strong> na plataforma Filadélfias.</p>

                    <p>Para acessar sua conta, utilize as credenciais abaixo:</p>

                    <div class="password-box">
                        <p style="margin: 0 0 10px 0; color: #6b7280;">Sua senha temporária:</p>
                        <p class="password">{temporary_password}</p>
                    </div>

                    <div class="warning">
                        <strong>⚠️ Importante:</strong> Por segurança, você será solicitado(a) a trocar sua senha no primeiro acesso.
                    </div>

                    <p style="text-align: center;">
                        <a href="{self.frontend_url}/login" class="button">Acessar Plataforma</a>
                    </p>

                    <p>Seu email de acesso: <strong>{to_email}</strong></p>
                </div>
                <div class="footer">
                    <p>© {church_name} · Powered by Filadélfias</p>
                    <p>Este é um email automático. Por favor, não responda.</p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            response = resend.Emails.send(
                {
                    "from": self.from_email,
                    "to": [to_email],
                    "subject": f"🎉 Bem-vindo(a) à {church_name} - Filadélfias",
                    "html": html_content,
                }
            )
            # Log success but avoid logging full response if it contains sensitive info
            log_info("Welcome email sent", to_email=to_email, response_id=response.get("id"))
            return True
        except Exception as e:
            log_error("Failed to send welcome email", error=str(e), to_email=to_email)
            return False

    async def send_password_reset_email(self, to_email: str, user_name: str, reset_token: str) -> bool:
        """
        Send password reset email.

        Args:
            to_email: Recipient email
            user_name: Name of the user
            reset_token: Password reset token

        Returns:
            True if email was sent successfully
        """
        if not self.is_configured():
            log_warning("Email service not configured - skipping reset email", to_email=to_email)
            return False

        reset_url = f"{self.frontend_url}/reset-password?token={reset_token}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }}
                .button {{ display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
                .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🔐 Redefinir Senha</h1>
                </div>
                <div class="content">
                    <p>Olá, <strong>{user_name}</strong>!</p>

                    <p>Recebemos uma solicitação para redefinir a senha da sua conta no Filadélfias.</p>

                    <p>Clique no botão abaixo para criar uma nova senha:</p>

                    <p style="text-align: center;">
                        <a href="{reset_url}" class="button">Redefinir Minha Senha</a>
                    </p>

                    <div class="warning">
                        <strong>⏰ Atenção:</strong> Este link expira em 1 hora.
                    </div>

                    <p style="color: #6b7280; font-size: 14px;">Se você não solicitou a redefinição de senha, ignore este email. Sua conta permanecerá segura.</p>
                </div>
                <div class="footer">
                    <p>© Filadélfias</p>
                    <p>Este é um email automático. Por favor, não responda.</p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            response = resend.Emails.send(
                {
                    "from": self.from_email,
                    "to": [to_email],
                    "subject": "🔐 Redefinir Senha - Filadélfias",
                    "html": html_content,
                }
            )
            log_info("Password reset email sent", to_email=to_email, response_id=response.get("id"))
            return True
        except Exception as e:
            log_error("Failed to send password reset email", error=str(e), to_email=to_email)
            return False


# Singleton instance
email_service = EmailService()
