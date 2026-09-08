from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, session: AsyncSession):
        super().__init__(Category, session)

    async def get_by_name(self, name: str) -> Optional[Category]:
        result = await self.session.execute(
            select(Category).where(Category.name.ilike(name))
        )
        return result.scalars().first()
