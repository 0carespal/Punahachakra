import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


class RequirementBase(BaseModel):
    quantity_required: float = Field(..., gt=0, description="Required material quantity (must be > 0)")
    budget_min: float = Field(..., ge=0, description="Minimum budget limit per unit")
    budget_max: float = Field(..., ge=0, description="Maximum budget limit per unit")
    description: Optional[str] = Field(None, description="Detailed requirement specification")
    location: Optional[str] = Field(None, max_length=255, description="Target city/location for requirement")

    @model_validator(mode="after")
    def validate_budget_range(self) -> "RequirementBase":
        if self.budget_min is not None and self.budget_max is not None:
            if self.budget_max < self.budget_min:
                raise ValueError("budget_max must be greater than or equal to budget_min")
        return self


class RequirementCreate(RequirementBase):
    material_name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Name of required material (e.g. Heavy Scrap Iron)"
    )
    category: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Scrap category (e.g. Ferrous Metals)"
    )
    material_id: Optional[uuid.UUID] = Field(
        None, description="UUID of existing Material entity if known"
    )

    @model_validator(mode="after")
    def validate_material_source(self) -> "RequirementCreate":
        if not self.material_id and not self.material_name:
            raise ValueError("Either material_name or material_id must be provided")
        return self


class RequirementUpdate(BaseModel):
    material_name: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    material_id: Optional[uuid.UUID] = None
    quantity_required: Optional[float] = Field(None, gt=0)
    budget_min: Optional[float] = Field(None, ge=0)
    budget_max: Optional[float] = Field(None, ge=0)
    description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)

    @model_validator(mode="after")
    def validate_budget_range(self) -> "RequirementUpdate":
        if self.budget_min is not None and self.budget_max is not None:
            if self.budget_max < self.budget_min:
                raise ValueError("budget_max must be greater than or equal to budget_min")
        return self


class RequirementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    company_name: str
    material_id: uuid.UUID
    material: str
    category: str
    quantity_required: float
    budget_min: float
    budget_max: float
    description: Optional[str]
    location: str
    status: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_db(cls, db_obj: any) -> "RequirementResponse":
        comp_name = db_obj.company.company_name if db_obj.company else ""
        mat_name = db_obj.material.name if db_obj.material else ""
        cat_name = db_obj.material.category if db_obj.material else ""
        negotiations = getattr(db_obj, "negotiations", []) or []
        if any(neg.transaction is not None or neg.status.value == "COMPLETED" for neg in negotiations):
            requirement_status = "COMPLETED"
        elif negotiations and all(neg.status.value == "CANCELLED" for neg in negotiations):
            requirement_status = "CANCELLED"
        elif any(neg.status.value == "ACCEPTED" for neg in negotiations):
            requirement_status = "MATCHED"
        elif negotiations:
            requirement_status = "NEGOTIATING"
        else:
            requirement_status = "ACTIVE"
        return cls(
            id=db_obj.id,
            company_id=db_obj.company_id,
            company_name=comp_name,
            material_id=db_obj.material_id,
            material=mat_name,
            category=cat_name,
            quantity_required=db_obj.quantity_required,
            budget_min=db_obj.budget_min,
            budget_max=db_obj.budget_max,
            description=db_obj.description,
            location=db_obj.location,
            status=requirement_status,
            created_at=db_obj.created_at,
            updated_at=db_obj.updated_at,
        )


class RequirementFilter(BaseModel):
    material: Optional[str] = Field(None, description="Filter by material name substring")
    category: Optional[str] = Field(None, description="Filter by category name substring")
    location: Optional[str] = Field(None, description="Filter by location substring")
    min_quantity: Optional[float] = Field(None, ge=0)
    max_quantity: Optional[float] = Field(None, ge=0)
    min_budget: Optional[float] = Field(None, ge=0)
    max_budget: Optional[float] = Field(None, ge=0)
