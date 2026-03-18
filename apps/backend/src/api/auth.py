"""
Authentication API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from src.domain.schemas import Token, UserCreate, UserResponse
from src.infra.repositories import membership_repository, tenant_repository, user_repository
from src.infra.repositories.member_repository import member_repository
from src.infra.security import create_access_token, decode_access_token, verify_password
from src.middleware.rate_limiter import limiter
from src.services.deletion_service import delete_user_data
from src.services.logging_service import log_info, log_warning, set_request_context

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def register(request: Request, user_data: UserCreate):
    """
    Register a new user (orphan user - not associated with any church).

    Rate limited to 3 requests per minute per IP.

    Args:
        request: FastAPI request object (for rate limiting)
        user_data: User registration data

    Returns:
        UserResponse: Created user data

    Raises:
        HTTPException: If email already exists
    """
    # Check if email already exists
    if await user_repository.exists_by_email(user_data.email):
        log_warning("Registration failed - email exists", email=user_data.email)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Create user
    user = await user_repository.create_user(email=user_data.email, name=user_data.name, password=user_data.password)

    log_info("User registered", user_id=user["id"], email=user["email"])
    return user


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login with email and password.

    Rate limited to 5 requests per minute per IP to prevent brute force attacks.

    Args:
        request: FastAPI request object (for rate limiting)
        form_data: OAuth2 form with username (email) and password

    Returns:
        Token: JWT access token

    Raises:
        HTTPException: If credentials are invalid
    """
    # Get user by email
    user = await user_repository.get_by_email(form_data.username)

    if not user:
        log_warning("Login failed - user not found", email=form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.get("password_hash", "")):
        log_warning("Login failed - wrong password", email=form_data.username, user_id=user["id"])
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", False):
        log_warning("Login failed - inactive user", email=form_data.username, user_id=user["id"])
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")

    # Create access token
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})

    # Set user context for subsequent logs
    set_request_context(user_id=user["id"])
    log_info("User logged in", user_id=user["id"], email=user["email"])

    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Get current authenticated user from JWT token.

    Args:
        token: JWT access token

    Returns:
        dict: Current user data with member_id if linked

    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = await user_repository.get_by_id(user_id)

    if user is None:
        raise credentials_exception

    # Try to find member_id from user's memberships
    memberships = await membership_repository.get_user_memberships(user_id)
    if memberships:
        # Get the first active membership's tenant and find member by user_id
        for membership in memberships:
            if membership.get("status") == "ACTIVE":
                tenant_id = membership.get("tenant_id")
                if tenant_id:
                    member = await member_repository.get_by_user_id(tenant_id, user_id)
                    if member:
                        user["member_id"] = member.get("id")
                        break

    return user


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    """
    Get current user profile with memberships.

    Args:
        current_user: Current authenticated user

    Returns:
        UserResponse: Current user data with memberships
    """
    set_request_context(user_id=current_user["id"])

    # Fetch user memberships
    memberships = await membership_repository.get_user_memberships(current_user["id"])
    log_info("Fetching user memberships", user_id=current_user["id"], memberships_count=len(memberships))

    # Enrich memberships with tenant data
    enriched_memberships = []
    for m in memberships:
        tenant = await tenant_repository.get(m["tenant_id"])
        if tenant:
            enriched_memberships.append(
                {
                    "id": m["id"],
                    "tenant": tenant,
                    "role": m.get("role", "ATTENDEE"),
                    "status": m.get("status", "ACTIVE"),
                    "joined_at": m.get("joined_at"),
                }
            )

    current_user["memberships"] = enriched_memberships
    return current_user


@router.put("/me/password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Change current user's password.

    Args:
        current_password: Current password for verification
        new_password: New password to set

    Returns:
        Success message

    Raises:
        HTTPException: If current password is incorrect
    """
    from src.infra.security import get_password_hash

    # Verify current password
    if not verify_password(current_password, current_user.get("password_hash", "")):
        log_warning("Password change failed - wrong current password", user_id=current_user["id"])
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta",
        )

    # Update password
    new_hash = get_password_hash(new_password)
    await user_repository.update_password(current_user["id"], new_hash)

    log_info("Password changed successfully", user_id=current_user["id"])
    return {"message": "Senha alterada com sucesso"}


@router.delete("/me")
async def delete_my_account(current_user: dict = Depends(get_current_user)):
    """
    Delete current user account and all associated data.

    WARNING: This action is irreversible and will:
    - Remove user from all churches (memberships)
    - Unlink user from member profiles
    - Delete the user account

    Note: This does NOT delete the church data, only the user's personal data.
    """
    deleted = await delete_user_data(current_user["id"])

    return {"message": "Sua conta foi excluída com sucesso", "deleted": deleted}
