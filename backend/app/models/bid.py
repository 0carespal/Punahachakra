import enum
import uuid
from typing import Optional, List
from sqlalchemy import Float, Text, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class BidStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class Bid(BaseModel):
    __tablename__ = "bids"

    listing_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    buyer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    bid_price_per_unit: Mapped[float] = mapped_column(Float, nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[BidStatus] = mapped_column(
        Enum(BidStatus, name="bidstatus_enum"),
        default=BidStatus.PENDING,
        nullable=False,
        index=True
    )

    # Relationships
    listing: Mapped["Listing"] = relationship("Listing", back_populates="bids")
    buyer: Mapped["User"] = relationship("User", back_populates="bids")
    order: Mapped[Optional["Order"]] = relationship("Order", back_populates="bid", uselist=False)
