import uuid
from fastapi import APIRouter, Depends, status
from app.api.deps import get_current_user, get_user_service, require_role
from app.models.user import User, UserRole
from app.schemas.common import APIResponse
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    KabadiwalaProfileUpdate,
    KabadiwalaProfileResponse,
    CompanyProfileUpdate,
    CompanyProfileResponse,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users & Profiles"])


@router.get(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Get authenticated user details and profile"
)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    return APIResponse(
        success=True,
        message="User profile retrieved successfully",
        data=UserResponse.model_validate(current_user)
    )


@router.put(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Update authenticated user basic information"
)
async def update_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    updated_user = await user_service.update_user(current_user.id, user_in)
    return APIResponse(
        success=True,
        message="User details updated successfully",
        data=UserResponse.model_validate(updated_user)
    )


@router.put(
    "/me/profile/kabadiwala",
    response_model=APIResponse[KabadiwalaProfileResponse],
    summary="Update Kabadiwala profile details",
    dependencies=[Depends(require_role([UserRole.KABADIWALA, UserRole.ADMIN]))]
)
async def update_kabadiwala_profile(
    profile_in: KabadiwalaProfileUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    profile = await user_service.update_kabadiwala_profile(current_user.id, profile_in)
    return APIResponse(
        success=True,
        message="Kabadiwala profile updated successfully",
        data=KabadiwalaProfileResponse.model_validate(profile)
    )


@router.put(
    "/me/profile/company",
    response_model=APIResponse[CompanyProfileResponse],
    summary="Update Company profile details",
    dependencies=[Depends(require_role([UserRole.COMPANY, UserRole.ADMIN]))]
)
async def update_company_profile(
    profile_in: CompanyProfileUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    profile = await user_service.update_company_profile(current_user.id, profile_in)
    return APIResponse(
        success=True,
        message="Company profile updated successfully",
        data=CompanyProfileResponse.model_validate(profile)
    )


@router.get(
    "/admin-only",
    response_model=APIResponse[dict],
    summary="Sample Admin-restricted endpoint (RBAC demonstration)",
    dependencies=[Depends(require_role([UserRole.ADMIN]))]
)
async def admin_only_route(
    current_user: User = Depends(get_current_user)
):
    return APIResponse(
        success=True,
        message="Access granted to Admin area",
        data={"admin_email": current_user.email, "role": current_user.role.value}
    )
