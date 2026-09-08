from typing import List
from sqlalchemy import String, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class Material(BaseModel):
    __tablename__ = "materials"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)

    __table_args__ = (
        Index("idx_material_name_category", "name", "category"),
    )

    # Relationships
    inventories: Mapped[List["Inventory"]] = relationship(
        "Inventory", back_populates="material"
    )
    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", back_populates="material"
    )
