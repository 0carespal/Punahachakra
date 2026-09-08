import enum
import uuid
from typing import Optional, List
from sqlalchemy import String, Boolean, Enum, ForeignKey, Float, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    COMPANY = "COMPANY"
    KABADIWALA = "KABADIWALA"


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="userrole_enum"),
        default=UserRole.KABADIWALA,
        nullable=False,
        index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # One-to-One Relationships
    kabadiwala_profile: Mapped[Optional["KabadiwalaProfile"]] = relationship(
        "KabadiwalaProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    company_profile: Mapped[Optional["CompanyProfile"]] = relationship(
        "CompanyProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    sent_offers: Mapped[List["Offer"]] = relationship(
        "Offer", back_populates="sender", cascade="all, delete-orphan"
    )
    listings: Mapped[List["Listing"]] = relationship(
        "Listing", back_populates="seller", cascade="all, delete-orphan"
    )
    bids: Mapped[List["Bid"]] = relationship(
        "Bid", back_populates="buyer", cascade="all, delete-orphan"
    )


class KabadiwalaProfile(BaseModel):
    __tablename__ = "kabadiwala_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    average_rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    visibility_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    __table_args__ = (
        CheckConstraint("average_rating >= 0.0 AND average_rating <= 5.0", name="chk_kabadiwala_rating_range"),
        CheckConstraint("visibility_score >= 0.0", name="chk_kabadiwala_visibility_score"),
        Index("idx_kabadiwala_location_rating", "location", "average_rating"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="kabadiwala_profile")
    inventories: Mapped[List["Inventory"]] = relationship(
        "Inventory", back_populates="kabadiwala", cascade="all, delete-orphan"
    )
    ratings_received: Mapped[List["Rating"]] = relationship(
        "Rating", back_populates="kabadiwala", cascade="all, delete-orphan"
    )


class CompanyProfile(BaseModel):
    __tablename__ = "company_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    company_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    location: Mapped[str] = mapped_column(String(255), index=True, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="company_profile")
    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", back_populates="company", cascade="all, delete-orphan"
    )
    ratings_given: Mapped[List["Rating"]] = relationship(
        "Rating", back_populates="company", cascade="all, delete-orphan"
    )
