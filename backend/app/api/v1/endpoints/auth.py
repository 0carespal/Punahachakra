from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from app.api.deps import get_auth_service
from app.schemas.auth import Token, RefreshTokenRequest, LoginRequest
from app.schemas.common import APIResponse
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user (Kabadiwala or Company)"
)
async def register(
    user_in: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    user = await auth_service.register(user_in)
    return APIResponse(
        success=True,
        message="User registered successfully",
        data=UserResponse.model_validate(user)
    )


@router.post(
    "/login",
    response_model=Token,
    summary="User Login (Supports OAuth2 form data & returns JWT Tokens)"
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service)
):
    token = await auth_service.login(email=form_data.username, password=form_data.password)
    return token


@router.post(
    "/login/json",
    response_model=APIResponse[Token],
    summary="User Login via JSON Payload"
)
async def login_json(
    credentials: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    token = await auth_service.login(email=credentials.email, password=credentials.password)
    return APIResponse(
        success=True,
        message="Login successful",
        data=token
    )


@router.post(
    "/refresh",
    response_model=APIResponse[Token],
    summary="Refresh Access Token using Refresh Token"
)
async def refresh_token(
    refresh_in: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    token = await auth_service.refresh_token(refresh_in.refresh_token)
    return APIResponse(
        success=True,
        message="Token refreshed successfully",
        data=token
    )
