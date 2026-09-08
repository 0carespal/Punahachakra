import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.order import OrderStatus
from app.schemas.user import UserResponse
from app.schemas.listing import ListingResponse


class OrderBase(BaseModel):
    listing_id: uuid.UUID
    bid_id: uuid.UUID
    total_price: float = Field(..., gt=0)


class OrderCreate(OrderBase):
    pass


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderResponse(OrderBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    seller_id: uuid.UUID
    buyer_id: uuid.UUID
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
    seller: Optional[UserResponse] = None
    buyer: Optional[UserResponse] = None
    listing: Optional[ListingResponse] = None
