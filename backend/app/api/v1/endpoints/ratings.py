import uuid
import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from app.api.deps import get_current_user, get_rating_service, require_role
from app.models.user import User, UserRole
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.rating import (
    RatingCreate,
    RatingResponse,
    RatingUpdate,
    KabadiwalaRatingSummary,
)
from app.services.rating_service import RatingService

router = APIRouter(prefix="/ratings", tags=["Ratings & Reviews Engine"])


@router.post(
    "",
    response_model=APIResponse[RatingResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Rate and review a Kabadiwala after transaction completion (Company / Admin)",
)
async def create_rating(
    rating_in: RatingCreate,
    current_user: User = Depends(require_role([UserRole.COMPANY, UserRole.ADMIN])),
    rating_service: RatingService = Depends(get_rating_service),
):
    rating = await rating_service.create_rating(current_user, rating_in)
    return APIResponse(
        success=True,
        message="Rating and review submitted successfully",
        data=RatingResponse.from_db(rating),
    )


@router.get(
    "/kabadiwala/{kabadiwala_id}",
    response_model=PaginatedResponse[RatingResponse],
    summary="View ratings and reviews received by a Kabadiwala",
)
async def list_kabadiwala_ratings(
    kabadiwala_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    rating_service: RatingService = Depends(get_rating_service),
):
    skip = (page - 1) * page_size
    items, total, summary = await rating_service.list_kabadiwala_ratings(
        kabadiwala_id=kabadiwala_id, skip=skip, limit=page_size
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return PaginatedResponse(
        items=[RatingResponse.from_db(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/me",
    response_model=PaginatedResponse[RatingResponse],
    summary="View ratings submitted by logged-in Company",
)
async def list_my_ratings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role([UserRole.COMPANY, UserRole.ADMIN])),
    rating_service: RatingService = Depends(get_rating_service),
):
    skip = (page - 1) * page_size
    items, total = await rating_service.list_my_given_ratings(
        current_user=current_user, skip=skip, limit=page_size
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return PaginatedResponse(
        items=[RatingResponse.from_db(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{rating_id}",
    response_model=APIResponse[RatingResponse],
    summary="Get rating details by ID",
)
async def get_rating(
    rating_id: uuid.UUID,
    rating_service: RatingService = Depends(get_rating_service),
):
    rating = await rating_service.get_rating(rating_id)
    return APIResponse(
        success=True,
        message="Rating details retrieved successfully",
        data=RatingResponse.from_db(rating),
    )


@router.put(
    "/{rating_id}",
    response_model=APIResponse[RatingResponse],
    summary="Update rating or review (Company owner / Admin)",
)
async def update_rating(
    rating_id: uuid.UUID,
    rating_in: RatingUpdate,
    current_user: User = Depends(require_role([UserRole.COMPANY, UserRole.ADMIN])),
    rating_service: RatingService = Depends(get_rating_service),
):
    rating = await rating_service.update_rating(rating_id, current_user, rating_in)
    return APIResponse(
        success=True,
        message="Rating updated successfully",
        data=RatingResponse.from_db(rating),
    )


@router.delete(
    "/{rating_id}",
    response_model=APIResponse[dict],
    summary="Delete rating (Company owner / Admin)",
)
async def delete_rating(
    rating_id: uuid.UUID,
    current_user: User = Depends(require_role([UserRole.COMPANY, UserRole.ADMIN])),
    rating_service: RatingService = Depends(get_rating_service),
):
    await rating_service.delete_rating(rating_id, current_user)
    return APIResponse(
        success=True,
        message="Rating deleted successfully",
        data={"id": str(rating_id)},
    )
