import uuid
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.material import Material
from app.repositories.base import BaseRepository


class MaterialRepository(BaseRepository[Material]):
    def __init__(self, session: AsyncSession):
        super().__init__(Material, session)

    async def get_by_name(self, name: str) -> Optional[Material]:
        result = await self.session.execute(
            select(Material).where(Material.name.ilike(name.strip()))
        )
        return result.scalars().first()

    async def get_or_create(self, name: str, category: str = "General Scrap") -> Material:
        clean_name = name.strip()
        clean_category = category.strip() if category else "General Scrap"
        
        existing = await self.get_by_name(clean_name)
        if existing:
            if clean_category and existing.category != clean_category:
                existing.category = clean_category
                self.session.add(existing)
                await self.session.flush()
                await self.session.refresh(existing)
            return existing

        new_material = Material(name=clean_name, category=clean_category)
        self.session.add(new_material)
        await self.session.flush()
        await self.session.refresh(new_material)
        return new_material
