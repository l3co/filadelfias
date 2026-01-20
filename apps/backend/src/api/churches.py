"""
API endpoints for church registration.
"""

from fastapi import APIRouter, HTTPException, status

from src.domain.schemas import ChurchRegistrationRequest, ChurchRegistrationResponse, TenantResponse, UserResponse
from src.infra.repositories import (
    member_repository,
    membership_repository,
    tenant_repository,
    user_repository,
)
from src.infra.security import create_access_token

router = APIRouter()


@router.post("/churches/register", response_model=ChurchRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_church(data: ChurchRegistrationRequest):
    """
    Register a new church with admin user.
    This is the main entry point for new churches joining the platform.

    Creates:
    - Tenant (church)
    - User (admin)
    - Member (admin as church member)
    - UserChurchMembership (link user to church as ADMIN)

    Returns JWT token for immediate login.
    """
    # Check if slug exists
    existing = await tenant_repository.get_by_slug(data.church_slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uma igreja com este identificador já existe. Escolha outro.",
        )

    # Check if email exists
    if await user_repository.exists_by_email(data.admin_email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Este email já está cadastrado na plataforma."
        )

    # Create Tenant (Church)
    tenant = await tenant_repository.create_tenant(
        name=data.church_name,
        slug=data.church_slug,
        street=data.street,
        number=data.number,
        complement=data.complement,
        neighborhood=data.neighborhood,
        city=data.city,
        state=data.state.upper() if data.state else None,
        postal_code=data.postal_code.replace("-", "") if data.postal_code else None,
    )

    # Create User (Admin)
    user = await user_repository.create_user(
        email=data.admin_email,
        password=data.admin_password,
        name=data.admin_name,
    )

    # Create Member (Admin as church member)
    await member_repository.create_member(
        tenant_id=tenant["id"],
        full_name=data.admin_name,
        email=data.admin_email,
        phone=data.admin_phone,
        status="COMUNGANTE",
        office="MEMBRO",
        user_id=user["id"],
    )

    # Create UserChurchMembership (Link user to church as ADMIN)
    await membership_repository.create_membership(
        user_id=user["id"],
        tenant_id=tenant["id"],
        role="ADMIN",
        status="ACTIVE",
    )

    # Generate JWT token
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})

    return ChurchRegistrationResponse(
        tenant=TenantResponse(
            id=tenant["id"],
            name=tenant["name"],
            slug=tenant["slug"],
            logo_url=tenant.get("logo_url"),
            street=tenant.get("street"),
            number=tenant.get("number"),
            complement=tenant.get("complement"),
            neighborhood=tenant.get("neighborhood"),
            city=tenant.get("city"),
            state=tenant.get("state"),
            postal_code=tenant.get("postal_code"),
            country=tenant.get("country", "Brasil"),
            phone=tenant.get("phone"),
            email=tenant.get("email"),
            created_at=tenant["created_at"],
        ),
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            avatar_url=user.get("avatar_url"),
            is_active=user.get("is_active", True),
            created_at=user["created_at"],
            memberships=[],
        ),
        access_token=access_token,
        token_type="bearer",
    )


@router.get("/churches/check-slug/{slug}")
async def check_slug_availability(slug: str):
    """
    Check if a church slug is available.
    Used for real-time validation in the registration wizard.
    """
    existing = await tenant_repository.get_by_slug(slug.lower())

    return {"slug": slug.lower(), "available": existing is None}
