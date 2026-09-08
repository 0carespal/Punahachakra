import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    def __init__(self, session: AsyncSession):
        super().__init__(Order, session)

    async def get_by_id_detailed(self, order_id: uuid.UUID) -> Optional[Order]:
        result = await self.session.execute(
            select(Order)
            .options(
                selectinload(Order.seller),
                selectinload(Order.buyer),
                selectinload(Order.listing),
                selectinload(Order.bid)
            )
            .where(Order.id == order_id)
        )
        return result.scalars().first()

    async def get_user_orders(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Order], int]:
        query = select(Order).options(
            selectinload(Order.seller),
            selectinload(Order.buyer),
            selectinload(Order.listing)
        ).where(
            or_(Order.seller_id == user_id, Order.buyer_id == user_id)
        )

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_query)).scalar_one()

        query = query.order_by(Order.created_at.desc()).offset(skip).limit(limit)
        items = list((await self.session.execute(query)).scalars().all())

        return items, total
