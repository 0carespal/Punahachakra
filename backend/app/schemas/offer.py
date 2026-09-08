import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class OfferCreate(BaseModel):
    offered_price: float = Field(..., gt=0, description="Offered price per unit (must be > 0)")
    offered_quantity: Optional[float] = Field(None, gt=0, description="Offered quantity (optional)")
    message: Optional[str] = Field(None, max_length=500, description="Optional note or counter-offer message")


class OfferResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    negotiation_id: uuid.UUID
    sender_id: uuid.UUID
    sender_email: Optional[str] = None
    sender_role: Optional[str] = None
    offered_price: float
    offered_quantity: Optional[float] = None
    message: Optional[str] = None
    timestamp: datetime

    @classmethod
    def from_db(cls, db_obj: any) -> "OfferResponse":
        email = db_obj.sender.email if db_obj.sender else None
        role = db_obj.sender.role.value if db_obj.sender and hasattr(db_obj.sender.role, "value") else None
        return cls(
            id=db_obj.id,
            negotiation_id=db_obj.negotiation_id,
            sender_id=db_obj.sender_id,
            sender_email=email,
            sender_role=role,
            offered_price=db_obj.offered_price,
            offered_quantity=getattr(db_obj, "offered_quantity", None),
            message=getattr(db_obj, "message", None),
            timestamp=db_obj.timestamp,
        )
