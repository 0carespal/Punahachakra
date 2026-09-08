import math
import uuid
from fastapi import APIRouter, Depends, Query
from app.api.deps import get_current_user, get_order_service
from app.models.user import User
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders & Transactions"])


@router.get(
    "/my-orders",
    response_model=APIResponse[PaginatedResponse[OrderResponse]],
    summary="Get current user's orders (both buying & selling)"
)
async def get_my_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service)
):
    skip = (page - 1) * page_size
    items, total = await order_service.get_my_orders(current_user, skip=skip, limit=page_size)

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return APIResponse(
        success=True,
        message="User orders retrieved",
        data=PaginatedResponse(
            items=[OrderResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )


@router.get(
    "/{order_id}",
    response_model=APIResponse[OrderResponse],
    summary="Get order details"
)
async def get_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service)
):
    order = await order_service.get_order(order_id, current_user)
    return APIResponse(
        success=True,
        message="Order details retrieved",
        data=OrderResponse.model_validate(order)
    )


@router.patch(
    "/{order_id}/status",
    response_model=APIResponse[OrderResponse],
    summary="Update order progress/status (IN_TRANSIT, DELIVERED, COMPLETED)"
)
async def update_order_status(
    order_id: uuid.UUID,
    status_update: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service)
):
    updated_order = await order_service.update_order_status(order_id, current_user, status_update.status)
    return APIResponse(
        success=True,
        message=f"Order status updated to {status_update.status.value}",
        data=OrderResponse.model_validate(updated_order)
    )
