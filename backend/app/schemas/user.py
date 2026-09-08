import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models.user import UserRole


# Kabadiwala Profile Schemas
class KabadiwalaProfileBase(BaseModel):
    full_name: str = Field(..., max_length=255)
    location: str = Field(..., max_length=255)


class KabadiwalaProfileCreate(KabadiwalaProfileBase):
    pass


class KabadiwalaProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=255)
    location: Optional[str] = Field(default=None, max_length=255)


class KabadiwalaProfileResponse(KabadiwalaProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    average_rating: float
    visibility_score: float
    created_at: datetime
    updated_at: datetime


# Company Profile Schemas
class CompanyProfileBase(BaseModel):
    company_name: str = Field(..., max_length=255)
    location: str = Field(..., max_length=255)


class CompanyProfileCreate(CompanyProfileBase):
    pass


class CompanyProfileUpdate(BaseModel):
    company_name: Optional[str] = Field(default=None, max_length=255)
    location: Optional[str] = Field(default=None, max_length=255)


class CompanyProfileResponse(CompanyProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.KABADIWALA


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)
    full_name: Optional[str] = None  # Used for Kabadiwala Profile
    company_name: Optional[str] = None  # Used for Company Profile
    location: Optional[str] = "India"  # General location


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    kabadiwala_profile: Optional[KabadiwalaProfileResponse] = None
    company_profile: Optional[CompanyProfileResponse] = None
