import enum
import uuid
from typing import Optional, List
from sqlalchemy import String, Text, Float, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class ListingStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    PENDING_DEAL = "PENDING_DEAL"
    SOLD = "SOLD"
    CANCELLED = "CANCELLED"


class Listing(BaseModel):
    __tablename__ = "listings"

    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(20), default="kg", nullable=False)
    price_per_unit: Mapped[float] = mapped_column(Float, nullable=False)
    city: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[ListingStatus] = mapped_column(
        Enum(ListingStatus, name="listingstatus_enum"),
        default=ListingStatus.ACTIVE,
        nullable=False,
        index=True
    )

    # Relationships
    seller: Mapped["User"] = relationship("User", back_populates="listings")
    category: Mapped["Category"] = relationship("Category", back_populates="listings")
    bids: Mapped[List["Bid"]] = relationship(
        "Bid", back_populates="listing", cascade="all, delete-orphan"
    )
    orders: Mapped[List["Order"]] = relationship(
        "Order", back_populates="listing"
    )
