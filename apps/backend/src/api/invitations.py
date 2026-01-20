"""
API endpoints for member invitations.
"""

import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from src.api.auth import get_current_user
from src.infra.repositories import (
    user_repository,
    member_repository,
    tenant_repository,
    membership_repository,
)
from src.infra.security import get_password_hash, verify_password
from src.services.email_service import email_service

router = APIRouter()


def generate_temporary_password(length: int = 8) -> str:
    """Generate a random temporary password."""
    # Use a mix of uppercase, lowercase, and digits (no confusing chars)
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(secrets.choice(chars) for _ in range(length))


def generate_reset_token() -> str:
    """Generate a secure password reset token."""
    return secrets.token_urlsafe(32)


class InviteResponse(BaseModel):
    success: bool
    message: str
    temporary_password: str | None = None
    email_sent: bool = False


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/tenants/{tenant_id}/members/{member_id}/invite", response_model=InviteResponse)
async def invite_member(
    tenant_id: str,
    member_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Invite a member to the platform.
    Creates a user account with temporary password and sends welcome email.
    """
    # Get member
    member = await member_repository.get(tenant_id, member_id)

    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membro não encontrado")

    if not member.get("email"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Membro não possui email cadastrado")

    if member.get("user_id"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Membro já possui conta na plataforma")

    # Check if user with this email already exists
    if await user_repository.exists_by_email(member["email"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Já existe uma conta com este email")

    # Get tenant info for email
    tenant = await tenant_repository.get(tenant_id)

    # Generate temporary password
    temp_password = generate_temporary_password()

    # Create user
    new_user = await user_repository.create_user(
        email=member["email"],
        password=temp_password,
        name=member["full_name"],
    )
    # Mark as must change password
    await user_repository.update(new_user["id"], {"must_change_password": True})

    # Link user to member
    await member_repository.link_user(tenant_id, member_id, new_user["id"])

    # Create membership (as regular member, not admin)
    await membership_repository.create_membership(
        user_id=new_user["id"],
        tenant_id=tenant_id,
        role="MEMBER",
        status="ACTIVE",
    )

    # Send welcome email
    email_sent = await email_service.send_welcome_email(
        to_email=member["email"],
        member_name=member["full_name"],
        church_name=tenant["name"] if tenant else "Igreja",
        temporary_password=temp_password,
    )

    return InviteResponse(
        success=True,
        message=f"Convite enviado para {member['email']}",
        temporary_password=temp_password,
        email_sent=email_sent,
    )


@router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """
    Request password reset email.
    """
    # Always return success to prevent email enumeration
    user = await user_repository.get_by_email(data.email)

    if user:
        # Generate reset token
        reset_token = generate_reset_token()
        expires = datetime.utcnow() + timedelta(hours=1)
        
        await user_repository.set_password_reset_token(user["id"], reset_token, expires)

        # Send reset email
        await email_service.send_password_reset_email(
            to_email=user["email"],
            user_name=user["name"],
            reset_token=reset_token
        )

    return {"message": "Se o email existir, você receberá instruções para redefinir sua senha."}


@router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """
    Reset password using token.
    """
    user = await user_repository.get_by_reset_token(data.token)

    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido ou expirado")

    # Update password
    await user_repository.update_password(user["id"], get_password_hash(data.new_password))

    return {"message": "Senha redefinida com sucesso"}


@router.post("/auth/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Change password (for first login or regular change).
    """
    # Verify current password
    if not verify_password(data.current_password, current_user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Senha atual incorreta")

    # Update password
    await user_repository.update_password(current_user["id"], get_password_hash(data.new_password))

    return {"message": "Senha alterada com sucesso"}
