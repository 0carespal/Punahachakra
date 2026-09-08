import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class KabadiwalaInventorySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    material_name: str
    category: str
    quantity: float
    price_range_min: float
    price_range_max: float


class RankedKabadiwalaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    kabadiwala_id: uuid.UUID
    user_id: uuid.UUID
    full_name: str
    location: str
    average_rating: float
    visibility_score: float
    material_match_score: float
    distance_km: float
    distance_score: float
    rating_score: float
    inventories: List[KabadiwalaInventorySummary] = []


class SellerSearchQuery(BaseModel):
    material: Optional[str] = Field(None, description="Material name to search for (e.g., Copper, Cardboard)")
    category: Optional[str] = Field(None, description="Category name to search for (e.g., Metal, Paper)")
    location: Optional[str] = Field(None, description="Buyer location city/state")
    latitude: Optional[float] = Field(None, description="Buyer latitude coordinate")
    longitude: Optional[float] = Field(None, description="Buyer longitude coordinate")
