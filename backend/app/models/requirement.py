import uuid
from typing import Optional, List
from sqlalchemy import String, Text, Float, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class Requirement(BaseModel):
    __tablename__ = "requirements"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    material_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("materials.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    quantity_required: Mapped[float] = mapped_column(Float, nullable=False)
    budget_min: Mapped[float] = mapped_column(Float, nullable=False)
    budget_max: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(255), index=True, nullable=False)

    __table_args__ = (
        CheckConstraint("quantity_required > 0.0", name="chk_req_quantity_positive"),
        CheckConstraint("budget_min >= 0.0", name="chk_req_budget_min_non_negative"),
        CheckConstraint("budget_max >= budget_min", name="chk_req_budget_range_valid"),
        Index("idx_requirement_company_material", "company_id", "material_id"),
    )

    # Relationships
    company: Mapped["CompanyProfile"] = relationship("CompanyProfile", back_populates="requirements")
    material: Mapped["Material"] = relationship("Material", back_populates="requirements")
    negotiations: Mapped[List["Negotiation"]] = relationship(
        "Negotiation", back_populates="requirement", cascade="all, delete-orphan"
    )
