import enum
import uuid
from typing import Optional
from sqlalchemy import Float, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class OrderStatus(str, enum.Enum):
    INITIATED = "INITIATED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Order(BaseModel):
    __tablename__ = "orders"

    listing_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("listings.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    bid_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bids.id", ondelete="RESTRICT"), unique=True, nullable=False
    )
    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    buyer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="orderstatus_enum"),
        default=OrderStatus.INITIATED,
        nullable=False,
        index=True
    )

    # Relationships
    listing: Mapped["Listing"] = relationship("Listing", back_populates="orders")
    bid: Mapped["Bid"] = relationship("Bid", back_populates="order")
    seller: Mapped["User"] = relationship("User", foreign_keys=[seller_id])
    buyer: Mapped["User"] = relationship("User", foreign_keys=[buyer_id])
