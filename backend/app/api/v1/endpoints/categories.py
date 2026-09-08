import uuid
from typing import List
from fastapi import APIRouter, Depends, status, Query
from app.api.deps import get_category_service, require_role, get_current_user
from app.models.user import UserRole, User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.common import APIResponse
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Recycling Categories"])


@router.get(
    "",
    response_model=APIResponse[List[CategoryResponse]],
    summary="List all scrap categories"
)
async def list_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    category_service: CategoryService = Depends(get_category_service)
):
    categories = await category_service.get_all(skip=skip, limit=limit)
    return APIResponse(
        success=True,
        message="Categories retrieved",
        data=[CategoryResponse.model_validate(c) for c in categories]
    )


@router.get(
    "/{category_id}",
    response_model=APIResponse[CategoryResponse],
    summary="Get category details by ID"
)
async def get_category(
    category_id: uuid.UUID,
    category_service: CategoryService = Depends(get_category_service)
):
    category = await category_service.get_by_id(category_id)
    return APIResponse(
        success=True,
        message="Category details retrieved",
        data=CategoryResponse.model_validate(category)
    )


@router.post(
    "",
    response_model=APIResponse[CategoryResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new scrap category (Admin only)",
    dependencies=[Depends(require_role([UserRole.ADMIN]))]
)
async def create_category(
    category_in: CategoryCreate,
    category_service: CategoryService = Depends(get_category_service)
):
    category = await category_service.create(category_in)
    return APIResponse(
        success=True,
        message="Category created successfully",
        data=CategoryResponse.model_validate(category)
    )


@router.put(
    "/{category_id}",
    response_model=APIResponse[CategoryResponse],
    summary="Update category (Admin only)",
    dependencies=[Depends(require_role([UserRole.ADMIN]))]
)
async def update_category(
    category_id: uuid.UUID,
    category_in: CategoryUpdate,
    category_service: CategoryService = Depends(get_category_service)
):
    category = await category_service.update(category_id, category_in)
    return APIResponse(
        success=True,
        message="Category updated successfully",
        data=CategoryResponse.model_validate(category)
    )
