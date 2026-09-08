import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.inventory import Inventory
from app.models.material import Material
from app.repositories.base import BaseRepository
from app.schemas.inventory import InventoryFilter


class InventoryRepository(BaseRepository[Inventory]):
    def __init__(self, session: AsyncSession):
        super().__init__(Inventory, session)

    async def get_by_id_detailed(self, inventory_id: uuid.UUID) -> Optional[Inventory]:
        result = await self.session.execute(
            select(Inventory)
            .options(
                selectinload(Inventory.material),
                selectinload(Inventory.kabadiwala)
            )
            .where(Inventory.id == inventory_id)
        )
        return result.scalars().first()

    async def filter_inventories(
        self,
        kabadiwala_id: Optional[uuid.UUID] = None,
        filters: Optional[InventoryFilter] = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Inventory], int]:
        query = select(Inventory).options(
            selectinload(Inventory.material),
            selectinload(Inventory.kabadiwala)
        ).join(Inventory.material)

        if kabadiwala_id:
            query = query.where(Inventory.kabadiwala_id == kabadiwala_id)

        if filters:
            if filters.material:
                query = query.where(Material.name.ilike(f"%{filters.material.strip()}%"))
            if filters.category:
                query = query.where(Material.category.ilike(f"%{filters.category.strip()}%"))
            if filters.min_quantity is not None:
                query = query.where(Inventory.quantity >= filters.min_quantity)
            if filters.max_quantity is not None:
                query = query.where(Inventory.quantity <= filters.max_quantity)
            if filters.min_price is not None:
                query = query.where(Inventory.price_range_min >= filters.min_price)
            if filters.max_price is not None:
                query = query.where(Inventory.price_range_max <= filters.max_price)

        # Count total items
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        # Execute paginated query ordered by updated_at / created_at descending
        query = query.order_by(Inventory.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_kabadiwala_and_material(
        self, kabadiwala_id: uuid.UUID, material_id: uuid.UUID
    ) -> Optional[Inventory]:
        result = await self.session.execute(
            select(Inventory)
            .options(
                selectinload(Inventory.material),
                selectinload(Inventory.kabadiwala)
            )
            .where(
                Inventory.kabadiwala_id == kabadiwala_id,
                Inventory.material_id == material_id
            )
        )
        return result.scalars().first()
