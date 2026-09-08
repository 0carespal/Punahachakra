from typing import Optional
from app.core.exceptions import BadRequestException, UnauthorizedException, DuplicateResourceException
from app.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password, decode_token
from app.models.user import User, UserRole, KabadiwalaProfile, CompanyProfile
from app.repositories.user_repository import UserRepository
from app.schemas.auth import Token
from app.schemas.user import UserCreate


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register(self, user_in: UserCreate) -> User:
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise DuplicateResourceException(f"User with email '{user_in.email}' already exists")

        hashed_password = get_password_hash(user_in.password)
        
        user_dict = {
            "email": user_in.email,
            "password_hash": hashed_password,
            "role": user_in.role,
            "is_active": True
        }
        user = await self.user_repo.create(user_dict)

        location = user_in.location or "India"

        if user_in.role == UserRole.KABADIWALA:
            full_name = user_in.full_name or user_in.email.split("@")[0].capitalize()
            profile = KabadiwalaProfile(
                user_id=user.id,
                full_name=full_name,
                location=location,
                average_rating=0.0,
                visibility_score=0.0
            )
            await self.user_repo.create_kabadiwala_profile(profile)

        elif user_in.role == UserRole.COMPANY:
            company_name = user_in.company_name or f"{user_in.email.split('@')[0].capitalize()} Recycling Ltd"
            profile = CompanyProfile(
                user_id=user.id,
                company_name=company_name,
                location=location
            )
            await self.user_repo.create_company_profile(profile)

        return await self.user_repo.get_with_profile(user.id)  # type: ignore

    async def login(self, email: str, password: str) -> Token:
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")

        if not user.is_active:
            raise BadRequestException("User account is inactive")

        access_token = create_access_token(subject=str(user.id), role=user.role.value)
        refresh_token = create_refresh_token(subject=str(user.id))

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )

    async def refresh_token(self, refresh_token_str: str) -> Token:
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid or expired refresh token")

        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid token payload")

        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or inactive")

        access_token = create_access_token(subject=str(user.id), role=user.role.value)
        new_refresh_token = create_refresh_token(subject=str(user.id))

        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
