import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Float, ForeignKey, DateTime, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class Transaction(BaseModel):
    __tablename__ = "transactions"

    negotiation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("negotiations.id", ondelete="RESTRICT"), unique=True, nullable=False, index=True
    )
    final_price: Mapped[float] = mapped_column(Float, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )

    __table_args__ = (
        CheckConstraint("final_price > 0.0", name="chk_transaction_final_price_positive"),
        Index("idx_transaction_completed_at", "completed_at"),
    )

    # Relationships
    negotiation: Mapped["Negotiation"] = relationship("Negotiation", back_populates="transaction")
