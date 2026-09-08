import enum
import uuid
from typing import List, Optional
from sqlalchemy import Enum, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class NegotiationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    INITIATED = "INITIATED"
    IN_PROGRESS = "IN_PROGRESS"
    CANCELLED = "CANCELLED"


class Negotiation(BaseModel):
    __tablename__ = "negotiations"

    requirement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("requirements.id", ondelete="CASCADE"), nullable=False, index=True
    )
    inventory_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("inventories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    status: Mapped[NegotiationStatus] = mapped_column(
        Enum(NegotiationStatus, name="negotiationstatus_enum"),
        default=NegotiationStatus.PENDING,
        nullable=False,
        index=True
    )

    __table_args__ = (
        Index("idx_negotiation_req_inv", "requirement_id", "inventory_id"),
    )

    # Relationships
    requirement: Mapped["Requirement"] = relationship("Requirement", back_populates="negotiations")
    inventory: Mapped[Optional["Inventory"]] = relationship("Inventory", back_populates="negotiations")
    offers: Mapped[List["Offer"]] = relationship(
        "Offer", back_populates="negotiation", cascade="all, delete-orphan", order_by="Offer.timestamp.asc()"
    )
    transaction: Mapped[Optional["Transaction"]] = relationship(
        "Transaction", back_populates="negotiation", uselist=False
    )
