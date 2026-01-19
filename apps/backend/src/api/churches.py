"""
API endpoints for church registration.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from src.infra.database import get_db
from src.infra.models import Tenant, User, UserChurchMembership, Member
from src.infra.repositories import TenantRepository
from src.domain.schemas import ChurchRegistrationRequest, ChurchRegistrationResponse, TenantResponse, UserResponse
from src.api.auth import create_access_token

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/churches/register", response_model=ChurchRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_church(
    data: ChurchRegistrationRequest,
    db: AsyncSession = Depends(get_db)
):
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
    repo = TenantRepository(db)
    
    # Check if slug exists
    existing = await repo.get_by_slug(data.church_slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uma igreja com este identificador já existe. Escolha outro."
        )
    
    # Check if email exists
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.email == data.admin_email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este email já está cadastrado na plataforma."
        )
    
    # Create Tenant (Church)
    tenant = Tenant(
        name=data.church_name,
        slug=data.church_slug,
        street=data.street,
        number=data.number,
        complement=data.complement,
        neighborhood=data.neighborhood,
        city=data.city,
        state=data.state.upper(),
        postal_code=data.postal_code.replace("-", ""),
        country="Brasil"
    )
    db.add(tenant)
    await db.flush()  # Get tenant.id
    
    # Create User (Admin)
    password_hash = pwd_context.hash(data.admin_password)
    user = User(
        email=data.admin_email,
        password_hash=password_hash,
        name=data.admin_name,
        is_active=True
    )
    db.add(user)
    await db.flush()  # Get user.id
    
    # Create Member (Admin as church member)
    member = Member(
        tenant_id=tenant.id,
        user_id=user.id,
        full_name=data.admin_name,
        email=data.admin_email,
        phone=data.admin_phone,
        status="COMUNGANTE",
        role="PASTOR"  # Admin is typically a pastor or leader
    )
    db.add(member)
    
    # Create UserChurchMembership (Link user to church as ADMIN)
    membership = UserChurchMembership(
        user_id=user.id,
        tenant_id=tenant.id,
        role="ADMIN",
        status="ACTIVE"
    )
    db.add(membership)
    
    await db.commit()
    await db.refresh(tenant)
    await db.refresh(user)
    
    # Generate JWT token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    return ChurchRegistrationResponse(
        tenant=TenantResponse.model_validate(tenant),
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
            created_at=user.created_at,
            memberships=[]
        ),
        access_token=access_token,
        token_type="bearer"
    )


@router.get("/churches/check-slug/{slug}")
async def check_slug_availability(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Check if a church slug is available.
    Used for real-time validation in the registration wizard.
    """
    repo = TenantRepository(db)
    existing = await repo.get_by_slug(slug.lower())
    
    return {
        "slug": slug.lower(),
        "available": existing is None
    }
