import uuid
import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from app.api.deps import get_current_user, get_inventory_service, require_role
from app.models.user import User, UserRole
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.inventory import (
    InventoryCreate,
    InventoryFilter,
    InventoryResponse,
    InventoryUpdate,
)
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])


@router.post(
    "",
    response_model=APIResponse[InventoryResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Add new inventory item (Kabadiwala / Admin)",
)
async def create_inventory(
    inventory_in: InventoryCreate,
    current_user: User = Depends(require_role([UserRole.KABADIWALA, UserRole.ADMIN])),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    inventory = await inventory_service.create_inventory(current_user, inventory_in)
    return APIResponse(
        success=True,
        message="Inventory item added successfully",
        data=InventoryResponse.from_db(inventory),
    )


@router.get(
    "/me",
    response_model=PaginatedResponse[InventoryResponse],
    summary="View logged-in Kabadiwala's inventory items",
)
async def get_my_inventory(
    material: Optional[str] = Query(None, description="Filter by material name"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    min_quantity: Optional[float] = Query(None, ge=0),
    max_quantity: Optional[float] = Query(None, ge=0),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role([UserRole.KABADIWALA, UserRole.ADMIN])),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    filters = InventoryFilter(
        material=material,
        category=category,
        min_quantity=min_quantity,
        max_quantity=max_quantity,
        min_price=min_price,
        max_price=max_price,
    )
    skip = (page - 1) * page_size
    items, total = await inventory_service.get_my_inventory(
        current_user=current_user, filters=filters, skip=skip, limit=page_size
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return PaginatedResponse(
        items=[InventoryResponse.from_db(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "",
    response_model=PaginatedResponse[InventoryResponse],
    summary="View/search all available inventory items across platform",
)
async def list_inventories(
    material: Optional[str] = Query(None, description="Filter by material name"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    min_quantity: Optional[float] = Query(None, ge=0),
    max_quantity: Optional[float] = Query(None, ge=0),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    filters = InventoryFilter(
        material=material,
        category=category,
        min_quantity=min_quantity,
        max_quantity=max_quantity,
        min_price=min_price,
        max_price=max_price,
    )
    skip = (page - 1) * page_size
    items, total = await inventory_service.list_inventories(
        filters=filters, skip=skip, limit=page_size
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return PaginatedResponse(
        items=[InventoryResponse.from_db(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{inventory_id}",
    response_model=APIResponse[InventoryResponse],
    summary="Get inventory item details by ID",
)
async def get_inventory(
    inventory_id: uuid.UUID,
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    inventory = await inventory_service.get_inventory(inventory_id)
    return APIResponse(
        success=True,
        message="Inventory item retrieved successfully",
        data=InventoryResponse.from_db(inventory),
    )


@router.put(
    "/{inventory_id}",
    response_model=APIResponse[InventoryResponse],
    summary="Update inventory item (Owner Kabadiwala / Admin)",
)
async def update_inventory(
    inventory_id: uuid.UUID,
    inventory_in: InventoryUpdate,
    current_user: User = Depends(require_role([UserRole.KABADIWALA, UserRole.ADMIN])),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    inventory = await inventory_service.update_inventory(
        inventory_id, current_user, inventory_in
    )
    return APIResponse(
        success=True,
        message="Inventory item updated successfully",
        data=InventoryResponse.from_db(inventory),
    )


@router.delete(
    "/{inventory_id}",
    response_model=APIResponse[dict],
    summary="Delete inventory item (Owner Kabadiwala / Admin)",
)
async def delete_inventory(
    inventory_id: uuid.UUID,
    current_user: User = Depends(require_role([UserRole.KABADIWALA, UserRole.ADMIN])),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    await inventory_service.delete_inventory(inventory_id, current_user)
    return APIResponse(
        success=True,
        message="Inventory item deleted successfully",
        data={"id": str(inventory_id)},
    )
