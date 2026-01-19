"""
API endpoints for member invitations.
"""
import secrets
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.auth import get_current_user
from src.infra.database import get_db
from src.infra.models import Member, Tenant, User, UserChurchMembership
from src.services.email_service import email_service

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_temporary_password(length: int = 8) -> str:
    """Generate a random temporary password."""
    # Use a mix of uppercase, lowercase, and digits (no confusing chars)
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return ''.join(secrets.choice(chars) for _ in range(length))


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
    tenant_id: UUID,
    member_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Invite a member to the platform.
    Creates a user account with temporary password and sends welcome email.
    """
    # Get member
    result = await db.execute(
        select(Member).where(Member.id == member_id, Member.tenant_id == tenant_id)
    )
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membro não encontrado"
        )

    if not member.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Membro não possui email cadastrado"
        )

    if member.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Membro já possui conta na plataforma"
        )

    # Check if user with this email already exists
    existing_user = await db.execute(
        select(User).where(User.email == member.email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma conta com este email"
        )

    # Get tenant info for email
    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()

    # Generate temporary password
    temp_password = generate_temporary_password()
    password_hash = pwd_context.hash(temp_password)

    # Create user
    new_user = User(
        email=member.email,
        password_hash=password_hash,
        name=member.full_name,
        is_active=True,
        must_change_password=True
    )
    db.add(new_user)
    await db.flush()

    # Link user to member
    member.user_id = new_user.id

    # Create membership (as regular member, not admin)
    membership = UserChurchMembership(
        user_id=new_user.id,
        tenant_id=tenant_id,
        role="MEMBER",
        status="ACTIVE"
    )
    db.add(membership)

    await db.commit()

    # Send welcome email
    email_sent = await email_service.send_welcome_email(
        to_email=member.email,
        member_name=member.full_name,
        church_name=tenant.name if tenant else "Igreja",
        temporary_password=temp_password
    )

    return InviteResponse(
        success=True,
        message=f"Convite enviado para {member.email}",
        temporary_password=temp_password,
        email_sent=email_sent
    )


@router.post("/auth/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request password reset email.
    """
    # Always return success to prevent email enumeration
    result = await db.execute(
        select(User).where(User.email == data.email)
    )
    user = result.scalar_one_or_none()

    if user:
        # Generate reset token
        reset_token = generate_reset_token()
        user.password_reset_token = reset_token
        user.password_reset_expires = datetime.utcnow() + timedelta(hours=1)

        await db.commit()

        # Send reset email
        await email_service.send_password_reset_email(
            to_email=user.email,
            user_name=user.name,
            reset_token=reset_token
        )

    return {"message": "Se o email existir, você receberá instruções para redefinir sua senha."}


@router.post("/auth/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Reset password using token.
    """
    result = await db.execute(
        select(User).where(
            User.password_reset_token == data.token,
            User.password_reset_expires > datetime.utcnow()
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )

    # Update password
    user.password_hash = pwd_context.hash(data.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    user.must_change_password = False

    await db.commit()

    return {"message": "Senha redefinida com sucesso"}


@router.post("/auth/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change password (for first login or regular change).
    """
    # Verify current password
    if not pwd_context.verify(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )

    # Update password
    current_user.password_hash = pwd_context.hash(data.new_password)
    current_user.must_change_password = False

    await db.commit()

    return {"message": "Senha alterada com sucesso"}
