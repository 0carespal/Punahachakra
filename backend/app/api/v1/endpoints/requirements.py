import uuid
import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from app.api.deps import get_current_user, get_requirement_service, require_role
from app.models.user import User, UserRole
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.requirement import (
    RequirementCreate,
    RequirementFilter,
    RequirementResponse,
    RequirementUpdate,
)
from app.services.requirement_service import RequirementService

router = APIRouter(prefix="/requirements", tags=["Company Requirements"])


@router.post(
    "",
    response_model=APIResponse[RequirementResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new scrap requirement (Company / Admin)",
)
async def create_requirement(
    requirement_in: RequirementCreate,
    current_user: User = Depends(require_role([UserRole.COMPANY, UserRole.ADMIN])),
    requirement_service: RequirementService = Depends(get_requirement_service),
):
    requirement = await requirement_service.create_requirement(current_user, requirement_in)
    return APIResponse(
        success=True,
        message="Requirement created successfully",
        data=RequirementResponse.from_db(requirement),
    )


@router.get(
    "/me",
    response_model=PaginatedResponse[RequirementResponse],
    summary="View logged-in Company's scrap requirements",
)
async def get_my_requirements(
    material: Optional[str] = Query(None, description="Filter by material name"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    location: Optional[str] = Query(None, description="Filter by location"),
    min_quantity: Optional[float] = Query(None, ge=0),
    max_quantity: Optional[float] = Query(None, ge=0),
    min_budget: Optional[float] = Query(None, ge=0),
    max_budget: Optional[float] = Query(None, ge=0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role([UserRole.COMPANY, UserRole.ADMIN])),
    requirement_service: RequirementService = Depends(get_requirement_service),
):
    filters = RequirementFilter(
        material=material,
        category=category,
        location=location,
        min_quantity=min_quantity,
        max_quantity=max_quantity,
        min_budget=min_budget,
        max_budget=max_budget,
    )
    skip = (page - 1) * page_size
    items, total = await requirement_service.get_my_requirements(
        current_user=current_user, filters=filters, skip=skip, limit=page_size
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return PaginatedResponse(
        items=[RequirementResponse.from_db(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "",
    response_model=PaginatedResponse[RequirementResponse],
    summary="View/search all active company requirements across platform",
)
async def list_requirements(
    material: Optional[str] = Query(None, description="Filter by material name"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    location: Optional[str] = Query(None, description="Filter by location"),
    min_quantity: Optional[float] = Query(None, ge=0),
    max_quantity: Optional[float] = Query(None, ge=0),
    min_budget: Optional[float] = Query(None, ge=0),
    max_budget: Optional[float] = Query(None, ge=0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    requirement_service: RequirementService = Depends(get_requirement_service),
):
    filters = RequirementFilter(
        material=material,
        category=category,
        location=location,
        min_quantity=min_quantity,
        max_quantity=max_quantity,
        min_budget=min_budget,
        max_budget=max_budget,
    )
    skip = (page - 1) * page_size
    items, total = await requirement_service.list_requirements(
        filters=filters, skip=skip, limit=page_size
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return PaginatedResponse(
        items=[RequirementResponse.from_db(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{requirement_id}",
    response_model=APIResponse[RequirementResponse],
    summary="Get requirement details by ID",
)
async def get_requirement(
    requirement_id: uuid.UUID,
    requirement_service: RequirementService = Depends(get_requirement_service),
):
    requirement = await requirement_service.get_requirement(requirement_id)
    return APIResponse(
        success=True,
        message="Requirement details retrieved successfully",
        data=RequirementResponse.from_db(requirement),
    )


@router.put(
    "/{requirement_id}",
    response_model=APIResponse[RequirementResponse],
    summary="Update requirement (Owner Company / Admin)",
)
async def update_requirement(
    requirement_id: uuid.UUID,
    requirement_in: RequirementUpdate,
    current_user: User = Depends(require_role([UserRole.COMPANY, UserRole.ADMIN])),
    requirement_service: RequirementService = Depends(get_requirement_service),
):
    requirement = await requirement_service.update_requirement(
        requirement_id, current_user, requirement_in
    )
    return APIResponse(
        success=True,
        message="Requirement updated successfully",
        data=RequirementResponse.from_db(requirement),
    )


@router.delete(
    "/{requirement_id}",
    response_model=APIResponse[dict],
    summary="Delete requirement (Owner Company / Admin)",
)
async def delete_requirement(
    requirement_id: uuid.UUID,
    current_user: User = Depends(require_role([UserRole.COMPANY, UserRole.ADMIN])),
    requirement_service: RequirementService = Depends(get_requirement_service),
):
    await requirement_service.delete_requirement(requirement_id, current_user)
    return APIResponse(
        success=True,
        message="Requirement deleted successfully",
        data={"id": str(requirement_id)},
    )
