import uuid
from typing import Optional
from sqlalchemy import Float, Text, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class Rating(BaseModel):
    __tablename__ = "ratings"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    kabadiwala_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("kabadiwala_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    transaction_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    stars: Mapped[float] = mapped_column(Float, nullable=False)
    review: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("stars >= 0.0 AND stars <= 5.0", name="chk_rating_stars_range"),
        Index("idx_rating_kabadiwala_stars", "kabadiwala_id", "stars"),
        Index("idx_rating_company_transaction", "company_id", "transaction_id"),
    )

    # Relationships
    company: Mapped["CompanyProfile"] = relationship("CompanyProfile", back_populates="ratings_given")
    kabadiwala: Mapped["KabadiwalaProfile"] = relationship("KabadiwalaProfile", back_populates="ratings_received")
    transaction: Mapped[Optional["Transaction"]] = relationship("Transaction")
