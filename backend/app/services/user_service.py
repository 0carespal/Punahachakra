import uuid
from typing import Optional, Union
from app.core.exceptions import NotFoundException, DuplicateResourceException
from app.models.user import User, UserRole, KabadiwalaProfile, CompanyProfile
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate, KabadiwalaProfileUpdate, CompanyProfileUpdate


class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def get_user_by_id(self, user_id: uuid.UUID) -> User:
        user = await self.user_repo.get_with_profile(user_id)
        if not user:
            raise NotFoundException(f"User with ID {user_id} not found")
        return user

    async def update_user(self, user_id: uuid.UUID, user_in: UserUpdate) -> User:
        user = await self.get_user_by_id(user_id)
        if user_in.email and user_in.email != user.email:
            existing = await self.user_repo.get_by_email(user_in.email)
            if existing:
                raise DuplicateResourceException("Email already in use")

        updated_user = await self.user_repo.update(user, user_in)
        return await self.get_user_by_id(updated_user.id)

    async def update_kabadiwala_profile(
        self, user_id: uuid.UUID, profile_in: KabadiwalaProfileUpdate
    ) -> KabadiwalaProfile:
        user = await self.get_user_by_id(user_id)
        if not user.kabadiwala_profile:
            profile = KabadiwalaProfile(
                user_id=user.id,
                full_name=profile_in.full_name or user.email.split("@")[0].capitalize(),
                location=profile_in.location or "India",
            )
            return await self.user_repo.create_kabadiwala_profile(profile)

        profile = user.kabadiwala_profile
        update_data = profile_in.model_dump(exclude_unset=True)
        for field, val in update_data.items():
            if val is not None:
                setattr(profile, field, val)

        self.user_repo.session.add(profile)
        await self.user_repo.session.flush()
        await self.user_repo.session.refresh(profile)
        return profile

    async def update_company_profile(
        self, user_id: uuid.UUID, profile_in: CompanyProfileUpdate
    ) -> CompanyProfile:
        user = await self.get_user_by_id(user_id)
        if not user.company_profile:
            profile = CompanyProfile(
                user_id=user.id,
                company_name=profile_in.company_name or f"{user.email.split('@')[0].capitalize()} Ltd",
                location=profile_in.location or "India",
            )
            return await self.user_repo.create_company_profile(profile)

        profile = user.company_profile
        update_data = profile_in.model_dump(exclude_unset=True)
        for field, val in update_data.items():
            if val is not None:
                setattr(profile, field, val)

        self.user_repo.session.add(profile)
        await self.user_repo.session.flush()
        await self.user_repo.session.refresh(profile)
        return profile
