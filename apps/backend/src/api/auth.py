"""
Authentication API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from src.domain.schemas import Token, UserCreate, UserResponse
from src.infra.repositories import user_repository
from src.infra.security import create_access_token, decode_access_token, verify_password
from src.services.deletion_service import delete_user_data

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Register a new user (orphan user - not associated with any church).

    Args:
        user_data: User registration data

    Returns:
        UserResponse: Created user data

    Raises:
        HTTPException: If email already exists
    """
    # Check if email already exists
    if await user_repository.exists_by_email(user_data.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Create user
    user = await user_repository.create_user(email=user_data.email, name=user_data.name, password=user_data.password)

    return user


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login with email and password.

    Args:
        form_data: OAuth2 form with username (email) and password

    Returns:
        Token: JWT access token

    Raises:
        HTTPException: If credentials are invalid
    """
    # Get user by email
    user = await user_repository.get_by_email(form_data.username)

    if not user or not verify_password(form_data.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")

    # Create access token
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})

    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Get current authenticated user from JWT token.

    Args:
        token: JWT access token

    Returns:
        dict: Current user data

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

    return user


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    """
    Get current user profile.

    Args:
        current_user: Current authenticated user

    Returns:
        UserResponse: Current user data
    """
    return current_user


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
