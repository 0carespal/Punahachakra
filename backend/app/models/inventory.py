import uuid
from typing import List
from sqlalchemy import Float, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class Inventory(BaseModel):
    __tablename__ = "inventories"

    kabadiwala_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("kabadiwala_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    material_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("materials.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    price_range_min: Mapped[float] = mapped_column(Float, nullable=False)
    price_range_max: Mapped[float] = mapped_column(Float, nullable=False)

    __table_args__ = (
        CheckConstraint("quantity > 0.0", name="chk_inventory_quantity_positive"),
        CheckConstraint("price_range_min >= 0.0", name="chk_inventory_price_min_non_negative"),
        CheckConstraint("price_range_max >= price_range_min", name="chk_inventory_price_range_valid"),
        Index("idx_inventory_kabadiwala_material", "kabadiwala_id", "material_id"),
    )

    # Relationships
    kabadiwala: Mapped["KabadiwalaProfile"] = relationship("KabadiwalaProfile", back_populates="inventories")
    material: Mapped["Material"] = relationship("Material", back_populates="inventories")
    negotiations: Mapped[List["Negotiation"]] = relationship(
        "Negotiation", back_populates="inventory", cascade="all, delete-orphan"
    )
