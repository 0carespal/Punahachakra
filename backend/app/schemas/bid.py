import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.bid import BidStatus
from app.schemas.user import UserResponse


class BidBase(BaseModel):
    listing_id: uuid.UUID
    bid_price_per_unit: float = Field(..., gt=0)
    total_amount: float = Field(..., gt=0)
    message: Optional[str] = None


class BidCreate(BidBase):
    pass


class BidStatusUpdate(BaseModel):
    status: BidStatus


class BidResponse(BidBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    buyer_id: uuid.UUID
    status: BidStatus
    created_at: datetime
    updated_at: datetime
    buyer: Optional[UserResponse] = None
