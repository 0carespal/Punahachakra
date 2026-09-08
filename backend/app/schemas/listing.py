import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.listing import ListingStatus
from app.schemas.category import CategoryResponse
from app.schemas.user import UserResponse


class ListingBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    category_id: uuid.UUID
    quantity: float = Field(..., gt=0)
    unit: str = Field(default="kg", max_length=20)
    price_per_unit: float = Field(..., gt=0)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    address: Optional[str] = None


class ListingCreate(ListingBase):
    pass


class ListingUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=255)
    description: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    quantity: Optional[float] = Field(default=None, gt=0)
    unit: Optional[str] = Field(default=None, max_length=20)
    price_per_unit: Optional[float] = Field(default=None, gt=0)
    city: Optional[str] = Field(default=None, min_length=2, max_length=100)
    state: Optional[str] = Field(default=None, min_length=2, max_length=100)
    address: Optional[str] = None
    status: Optional[ListingStatus] = None


class ListingFilter(BaseModel):
    category_id: Optional[uuid.UUID] = None
    city: Optional[str] = None
    state: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    status: Optional[ListingStatus] = ListingStatus.ACTIVE


class ListingResponse(ListingBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    seller_id: uuid.UUID
    status: ListingStatus
    created_at: datetime
    updated_at: datetime
    seller: Optional[UserResponse] = None
    category: Optional[CategoryResponse] = None
