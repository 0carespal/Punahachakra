import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


class InventoryBase(BaseModel):
    quantity: float = Field(..., gt=0, description="Quantity of inventory item (must be > 0)")
    price_range_min: float = Field(..., ge=0, description="Minimum expected price per unit")
    price_range_max: float = Field(..., ge=0, description="Maximum expected price per unit")

    @model_validator(mode="after")
    def validate_price_range(self) -> "InventoryBase":
        if self.price_range_min is not None and self.price_range_max is not None:
            if self.price_range_max < self.price_range_min:
                raise ValueError("price_range_max must be greater than or equal to price_range_min")
        return self


class InventoryCreate(InventoryBase):
    material_name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Material name (e.g. Copper Wire, Cardboard)"
    )
    category: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Category of scrap material (e.g. Metal, Paper)"
    )
    material_id: Optional[uuid.UUID] = Field(
        None, description="UUID of existing Material entity if known"
    )

    @model_validator(mode="after")
    def validate_material_source(self) -> "InventoryCreate":
        if not self.material_id and not self.material_name:
            raise ValueError("Either material_name or material_id must be provided")
        return self


class InventoryUpdate(BaseModel):
    material_name: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    material_id: Optional[uuid.UUID] = None
    quantity: Optional[float] = Field(None, gt=0)
    price_range_min: Optional[float] = Field(None, ge=0)
    price_range_max: Optional[float] = Field(None, ge=0)

    @model_validator(mode="after")
    def validate_price_range(self) -> "InventoryUpdate":
        if self.price_range_min is not None and self.price_range_max is not None:
            if self.price_range_max < self.price_range_min:
                raise ValueError("price_range_max must be greater than or equal to price_range_min")
        return self


class MaterialSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    category: str


class InventoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    kabadiwala_id: uuid.UUID
    material_id: uuid.UUID
    material: str
    category: str
    quantity: float
    price_range_min: float
    price_range_max: float
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_db(cls, db_obj: any) -> "InventoryResponse":
        mat_name = db_obj.material.name if db_obj.material else ""
        cat_name = db_obj.material.category if db_obj.material else ""
        return cls(
            id=db_obj.id,
            kabadiwala_id=db_obj.kabadiwala_id,
            material_id=db_obj.material_id,
            material=mat_name,
            category=cat_name,
            quantity=db_obj.quantity,
            price_range_min=db_obj.price_range_min,
            price_range_max=db_obj.price_range_max,
            created_at=db_obj.created_at,
            updated_at=db_obj.updated_at,
        )


class InventoryFilter(BaseModel):
    material: Optional[str] = Field(None, description="Filter by material name substring")
    category: Optional[str] = Field(None, description="Filter by category name substring")
    min_quantity: Optional[float] = Field(None, ge=0)
    max_quantity: Optional[float] = Field(None, ge=0)
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)
