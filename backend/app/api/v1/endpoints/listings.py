import math
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from app.api.deps import get_current_user, get_listing_service
from app.models.user import User
from app.models.listing import ListingStatus
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.listing import ListingCreate, ListingFilter, ListingResponse, ListingUpdate
from app.services.listing_service import ListingService

router = APIRouter(prefix="/listings", tags=["Scrap Listings"])


@router.post(
    "",
    response_model=APIResponse[ListingResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new scrap listing (Kabadiwala)"
)
async def create_listing(
    listing_in: ListingCreate,
    current_user: User = Depends(get_current_user),
    listing_service: ListingService = Depends(get_listing_service)
):
    listing = await listing_service.create_listing(current_user, listing_in)
    return APIResponse(
        success=True,
        message="Scrap listing created successfully",
        data=ListingResponse.model_validate(listing)
    )


@router.get(
    "",
    response_model=APIResponse[PaginatedResponse[ListingResponse]],
    summary="Browse & Filter scrap listings (Public/Companies)"
)
async def filter_listings(
    category_id: Optional[uuid.UUID] = Query(None),
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    status_filter: Optional[ListingStatus] = Query(ListingStatus.ACTIVE),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    listing_service: ListingService = Depends(get_listing_service)
):
    filters = ListingFilter(
        category_id=category_id,
        city=city,
        state=state,
        min_price=min_price,
        max_price=max_price,
        status=status_filter
    )
    skip = (page - 1) * page_size
    items, total = await listing_service.filter_listings(filters, skip=skip, limit=page_size)

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return APIResponse(
        success=True,
        message="Listings retrieved",
        data=PaginatedResponse(
            items=[ListingResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )


@router.get(
    "/my-listings",
    response_model=APIResponse[PaginatedResponse[ListingResponse]],
    summary="Get current user's listings"
)
async def get_my_listings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    listing_service: ListingService = Depends(get_listing_service)
):
    skip = (page - 1) * page_size
    items, total = await listing_service.get_my_listings(current_user, skip=skip, limit=page_size)

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return APIResponse(
        success=True,
        message="User listings retrieved",
        data=PaginatedResponse(
            items=[ListingResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )


@router.get(
    "/{listing_id}",
    response_model=APIResponse[ListingResponse],
    summary="Get listing details"
)
async def get_listing(
    listing_id: uuid.UUID,
    listing_service: ListingService = Depends(get_listing_service)
):
    listing = await listing_service.get_listing(listing_id)
    return APIResponse(
        success=True,
        message="Listing details retrieved",
        data=ListingResponse.model_validate(listing)
    )


@router.put(
    "/{listing_id}",
    response_model=APIResponse[ListingResponse],
    summary="Update listing details"
)
async def update_listing(
    listing_id: uuid.UUID,
    listing_in: ListingUpdate,
    current_user: User = Depends(get_current_user),
    listing_service: ListingService = Depends(get_listing_service)
):
    listing = await listing_service.update_listing(listing_id, current_user, listing_in)
    return APIResponse(
        success=True,
        message="Listing updated successfully",
        data=ListingResponse.model_validate(listing)
    )


@router.delete(
    "/{listing_id}",
    response_model=APIResponse[bool],
    summary="Delete listing"
)
async def delete_listing(
    listing_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    listing_service: ListingService = Depends(get_listing_service)
):
    deleted = await listing_service.delete_listing(listing_id, current_user)
    return APIResponse(
        success=True,
        message="Listing deleted successfully",
        data=deleted
    )
