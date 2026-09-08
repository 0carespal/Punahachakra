import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class RatingCreate(BaseModel):
    kabadiwala_id: uuid.UUID = Field(..., description="ID of Kabadiwala profile being rated")
    transaction_id: Optional[uuid.UUID] = Field(
        None, description="Optional ID of completed transaction associated with this rating"
    )
    stars: float = Field(..., ge=0.0, le=5.0, description="Star rating between 0.0 and 5.0")
    review: Optional[str] = Field(None, max_length=2000, description="Optional text review or feedback")


class RatingUpdate(BaseModel):
    stars: Optional[float] = Field(None, ge=0.0, le=5.0, description="Updated star rating between 0.0 and 5.0")
    review: Optional[str] = Field(None, max_length=2000, description="Updated text review")


class RatingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    company_name: str
    kabadiwala_id: uuid.UUID
    kabadiwala_name: str
    transaction_id: Optional[uuid.UUID] = None
    stars: float
    review: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_db(cls, db_obj: any) -> "RatingResponse":
        comp_name = db_obj.company.company_name if db_obj.company else "Company"
        kab_name = db_obj.kabadiwala.full_name if db_obj.kabadiwala else "Kabadiwala"
        return cls(
            id=db_obj.id,
            company_id=db_obj.company_id,
            company_name=comp_name,
            kabadiwala_id=db_obj.kabadiwala_id,
            kabadiwala_name=kab_name,
            transaction_id=db_obj.transaction_id,
            stars=db_obj.stars,
            review=db_obj.review,
            created_at=db_obj.created_at,
            updated_at=db_obj.updated_at,
        )


class KabadiwalaRatingSummary(BaseModel):
    kabadiwala_id: uuid.UUID
    kabadiwala_name: str
    average_rating: float
    total_ratings: int
