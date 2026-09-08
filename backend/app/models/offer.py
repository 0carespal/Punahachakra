import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Float, ForeignKey, DateTime, String, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class Offer(BaseModel):
    __tablename__ = "offers"

    negotiation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("negotiations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    offered_price: Mapped[float] = mapped_column(Float, nullable=False)
    offered_quantity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    message: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )

    __table_args__ = (
        CheckConstraint("offered_price > 0.0", name="chk_offer_price_positive"),
        Index("idx_offer_negotiation_timestamp", "negotiation_id", "timestamp"),
    )

    # Relationships
    negotiation: Mapped["Negotiation"] = relationship("Negotiation", back_populates="offers")
    sender: Mapped["User"] = relationship("User", back_populates="sent_offers")
