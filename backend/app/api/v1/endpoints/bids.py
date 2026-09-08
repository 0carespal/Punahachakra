import math
import uuid
from fastapi import APIRouter, Depends, status, Query
from app.api.deps import get_bid_service, get_current_user
from app.models.user import User
from app.schemas.bid import BidCreate, BidResponse, BidStatusUpdate
from app.schemas.common import APIResponse, PaginatedResponse
from app.services.bid_service import BidService

router = APIRouter(prefix="/bids", tags=["Bids & Offers"])


@router.post(
    "",
    response_model=APIResponse[BidResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Submit a bid for a scrap listing (Company)"
)
async def create_bid(
    bid_in: BidCreate,
    current_user: User = Depends(get_current_user),
    bid_service: BidService = Depends(get_bid_service)
):
    bid = await bid_service.create_bid(current_user, bid_in)
    return APIResponse(
        success=True,
        message="Bid submitted successfully",
        data=BidResponse.model_validate(bid)
    )


@router.get(
    "/my-bids",
    response_model=APIResponse[PaginatedResponse[BidResponse]],
    summary="Get current company user's submitted bids"
)
async def get_my_bids(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    bid_service: BidService = Depends(get_bid_service)
):
    skip = (page - 1) * page_size
    items, total = await bid_service.get_my_bids(current_user, skip=skip, limit=page_size)

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return APIResponse(
        success=True,
        message="User bids retrieved",
        data=PaginatedResponse(
            items=[BidResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )


@router.get(
    "/listing/{listing_id}",
    response_model=APIResponse[PaginatedResponse[BidResponse]],
    summary="Get all bids for a specific listing (Listing Seller only)"
)
async def get_listing_bids(
    listing_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    bid_service: BidService = Depends(get_bid_service)
):
    skip = (page - 1) * page_size
    items, total = await bid_service.get_listing_bids(listing_id, current_user, skip=skip, limit=page_size)

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return APIResponse(
        success=True,
        message="Listing bids retrieved",
        data=PaginatedResponse(
            items=[BidResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )


@router.patch(
    "/{bid_id}/status",
    response_model=APIResponse[BidResponse],
    summary="Accept or Reject a bid (Kabadiwala/Seller)"
)
async def respond_to_bid(
    bid_id: uuid.UUID,
    status_update: BidStatusUpdate,
    current_user: User = Depends(get_current_user),
    bid_service: BidService = Depends(get_bid_service)
):
    updated_bid = await bid_service.respond_to_bid(bid_id, current_user, status_update.status)
    return APIResponse(
        success=True,
        message=f"Bid status updated to {status_update.status.value}",
        data=BidResponse.model_validate(updated_bid)
    )
