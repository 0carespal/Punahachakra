import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.bid import Bid, BidStatus
from app.repositories.base import BaseRepository


class BidRepository(BaseRepository[Bid]):
    def __init__(self, session: AsyncSession):
        super().__init__(Bid, session)

    async def get_by_id_detailed(self, bid_id: uuid.UUID) -> Optional[Bid]:
        result = await self.session.execute(
            select(Bid)
            .options(
                selectinload(Bid.buyer),
                selectinload(Bid.listing)
            )
            .where(Bid.id == bid_id)
        )
        return result.scalars().first()

    async def get_by_listing(
        self, listing_id: uuid.UUID, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Bid], int]:
        query = select(Bid).options(
            selectinload(Bid.buyer)
        ).where(Bid.listing_id == listing_id)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_query)).scalar_one()

        query = query.order_by(Bid.created_at.desc()).offset(skip).limit(limit)
        items = list((await self.session.execute(query)).scalars().all())

        return items, total

    async def get_by_buyer(
        self, buyer_id: uuid.UUID, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Bid], int]:
        query = select(Bid).options(
            selectinload(Bid.listing)
        ).where(Bid.buyer_id == buyer_id)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_query)).scalar_one()

        query = query.order_by(Bid.created_at.desc()).offset(skip).limit(limit)
        items = list((await self.session.execute(query)).scalars().all())

        return items, total
