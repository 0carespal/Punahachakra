import uuid
from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, KabadiwalaProfile, CompanyProfile
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(
            select(User)
            .options(
                selectinload(User.kabadiwala_profile),
                selectinload(User.company_profile)
            )
            .where(User.email == email)
        )
        return result.scalars().first()

    async def get_with_profile(self, user_id: uuid.UUID | str) -> Optional[User]:
        if isinstance(user_id, str):
            try:
                user_id = uuid.UUID(user_id)
            except ValueError:
                return None
        result = await self.session.execute(
            select(User)
            .options(
                selectinload(User.kabadiwala_profile),
                selectinload(User.company_profile)
            )
            .where(User.id == user_id)
        )
        return result.scalars().first()

    async def create_kabadiwala_profile(self, profile: KabadiwalaProfile) -> KabadiwalaProfile:
        self.session.add(profile)
        await self.session.flush()
        await self.session.refresh(profile)
        return profile

    async def create_company_profile(self, profile: CompanyProfile) -> CompanyProfile:
        self.session.add(profile)
        await self.session.flush()
        await self.session.refresh(profile)
        return profile
