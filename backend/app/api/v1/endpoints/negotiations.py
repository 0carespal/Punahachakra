import uuid
import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from app.api.deps import get_current_user, get_negotiation_service, require_role
from app.models.user import User, UserRole
from app.models.negotiation import NegotiationStatus
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.negotiation import (
    NegotiationCreate,
    NegotiationFilter,
    NegotiationResponse,
)
from app.schemas.offer import OfferCreate
from app.services.negotiation_service import NegotiationService

router = APIRouter(prefix="/negotiations", tags=["Negotiation Engine"])


@router.post(
    "",
    response_model=APIResponse[NegotiationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Initiate negotiation on a requirement (Kabadiwala / Admin)",
)
async def initiate_negotiation(
    negotiation_in: NegotiationCreate,
    current_user: User = Depends(require_role([UserRole.KABADIWALA, UserRole.ADMIN])),
    negotiation_service: NegotiationService = Depends(get_negotiation_service),
):
    negotiation = await negotiation_service.initiate_negotiation(current_user, negotiation_in)
    return APIResponse(
        success=True,
        message="Negotiation initiated successfully",
        data=NegotiationResponse.from_db(negotiation),
    )


@router.get(
    "/me",
    response_model=PaginatedResponse[NegotiationResponse],
    summary="View negotiations for logged-in user (Company / Kabadiwala)",
)
async def list_my_negotiations(
    status_filter: Optional[NegotiationStatus] = Query(None, alias="status", description="Filter by status"),
    requirement_id: Optional[uuid.UUID] = Query(None, description="Filter by requirement ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    negotiation_service: NegotiationService = Depends(get_negotiation_service),
):
    filters = NegotiationFilter(status=status_filter, requirement_id=requirement_id)
    skip = (page - 1) * page_size
    items, total = await negotiation_service.list_my_negotiations(
        current_user=current_user, filters=filters, skip=skip, limit=page_size
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return PaginatedResponse(
        items=[NegotiationResponse.from_db(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{negotiation_id}",
    response_model=APIResponse[NegotiationResponse],
    summary="Get negotiation details with full offer history",
)
async def get_negotiation(
    negotiation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    negotiation_service: NegotiationService = Depends(get_negotiation_service),
):
    negotiation = await negotiation_service.get_negotiation(negotiation_id, current_user)
    return APIResponse(
        success=True,
        message="Negotiation details retrieved successfully",
        data=NegotiationResponse.from_db(negotiation),
    )


@router.post(
    "/{negotiation_id}/offer",
    response_model=APIResponse[NegotiationResponse],
    summary="Submit a counter-offer in negotiation (Company / Kabadiwala)",
)
async def send_offer(
    negotiation_id: uuid.UUID,
    offer_in: OfferCreate,
    current_user: User = Depends(get_current_user),
    negotiation_service: NegotiationService = Depends(get_negotiation_service),
):
    negotiation = await negotiation_service.send_offer(negotiation_id, current_user, offer_in)
    return APIResponse(
        success=True,
        message="Counter-offer submitted successfully",
        data=NegotiationResponse.from_db(negotiation),
    )


@router.post(
    "/{negotiation_id}/accept",
    response_model=APIResponse[NegotiationResponse],
    summary="Accept current offer in negotiation",
)
async def accept_offer(
    negotiation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    negotiation_service: NegotiationService = Depends(get_negotiation_service),
):
    negotiation = await negotiation_service.accept_offer(negotiation_id, current_user)
    return APIResponse(
        success=True,
        message="Negotiation offer accepted successfully",
        data=NegotiationResponse.from_db(negotiation),
    )


@router.post(
    "/{negotiation_id}/reject",
    response_model=APIResponse[NegotiationResponse],
    summary="Reject negotiation",
)
async def reject_offer(
    negotiation_id: uuid.UUID,
    reason: Optional[str] = Query(None, description="Optional rejection reason"),
    current_user: User = Depends(get_current_user),
    negotiation_service: NegotiationService = Depends(get_negotiation_service),
):
    negotiation = await negotiation_service.reject_offer(negotiation_id, current_user, message=reason)
    return APIResponse(
        success=True,
        message="Negotiation rejected",
        data=NegotiationResponse.from_db(negotiation),
    )


@router.post(
    "/{negotiation_id}/complete",
    response_model=APIResponse[NegotiationResponse],
    summary="Mark accepted negotiation deal as completed",
)
async def complete_negotiation(
    negotiation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    negotiation_service: NegotiationService = Depends(get_negotiation_service),
):
    negotiation = await negotiation_service.complete_negotiation(negotiation_id, current_user)
    return APIResponse(
        success=True,
        message="Negotiation deal completed successfully",
        data=NegotiationResponse.from_db(negotiation),
    )
