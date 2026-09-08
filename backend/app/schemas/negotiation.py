import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.negotiation import NegotiationStatus
from app.schemas.offer import OfferResponse


class NegotiationCreate(BaseModel):
    requirement_id: uuid.UUID = Field(..., description="Target company requirement ID to negotiate on")
    inventory_id: Optional[uuid.UUID] = Field(None, description="Optional linked Kabadiwala inventory ID")
    offered_price: float = Field(..., gt=0, description="Initial offered price per unit (must be > 0)")
    offered_quantity: Optional[float] = Field(None, gt=0, description="Initial offered quantity")
    message: Optional[str] = Field(None, max_length=500, description="Initial message or note")


class NegotiationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    requirement_id: uuid.UUID
    inventory_id: Optional[uuid.UUID] = None
    status: NegotiationStatus
    company_name: str
    kabadiwala_name: str
    material_name: str
    category: str
    quantity_required: float
    budget_min: float
    budget_max: float
    latest_offered_price: Optional[float] = None
    latest_offered_quantity: Optional[float] = None
    offers_history: List[OfferResponse] = []
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_db(cls, db_obj: any) -> "NegotiationResponse":
        comp_name = db_obj.requirement.company.company_name if db_obj.requirement and db_obj.requirement.company else "Company"
        mat_name = db_obj.requirement.material.name if db_obj.requirement and db_obj.requirement.material else ""
        cat_name = db_obj.requirement.material.category if db_obj.requirement and db_obj.requirement.material else ""
        qty_req = db_obj.requirement.quantity_required if db_obj.requirement else 0.0
        b_min = db_obj.requirement.budget_min if db_obj.requirement else 0.0
        b_max = db_obj.requirement.budget_max if db_obj.requirement else 0.0

        kabadiwala_name = "Kabadiwala"
        offers_list = []
        if db_obj.offers:
            offers_list = [OfferResponse.from_db(o) for o in db_obj.offers]
            # First offer sender can tell us Kabadiwala name if sent by Kabadiwala
            first_offer = db_obj.offers[0]
            if first_offer.sender and getattr(first_offer.sender, "kabadiwala_profile", None):
                kabadiwala_name = first_offer.sender.kabadiwala_profile.full_name
            elif db_obj.inventory and db_obj.inventory.kabadiwala:
                kabadiwala_name = db_obj.inventory.kabadiwala.full_name

        latest_price = offers_list[-1].offered_price if offers_list else None
        latest_qty = offers_list[-1].offered_quantity if offers_list else None

        return cls(
            id=db_obj.id,
            requirement_id=db_obj.requirement_id,
            inventory_id=db_obj.inventory_id,
            status=db_obj.status,
            company_name=comp_name,
            kabadiwala_name=kabadiwala_name,
            material_name=mat_name,
            category=cat_name,
            quantity_required=qty_req,
            budget_min=b_min,
            budget_max=b_max,
            latest_offered_price=latest_price,
            latest_offered_quantity=latest_qty,
            offers_history=offers_list,
            created_at=db_obj.created_at,
            updated_at=db_obj.updated_at,
        )


class NegotiationFilter(BaseModel):
    status: Optional[NegotiationStatus] = Field(None, description="Filter by negotiation status")
    requirement_id: Optional[uuid.UUID] = Field(None, description="Filter by requirement ID")
