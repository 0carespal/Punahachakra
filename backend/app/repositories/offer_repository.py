import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.offer import Offer
from app.repositories.base import BaseRepository


class OfferRepository(BaseRepository[Offer]):
    def __init__(self, session: AsyncSession):
        super().__init__(Offer, session)

    async def get_offers_by_negotiation(self, negotiation_id: uuid.UUID) -> List[Offer]:
        result = await self.session.execute(
            select(Offer)
            .options(selectinload(Offer.sender))
            .where(Offer.negotiation_id == negotiation_id)
            .order_by(Offer.timestamp.asc())
        )
        return list(result.scalars().all())

    async def get_latest_offer(self, negotiation_id: uuid.UUID) -> Optional[Offer]:
        result = await self.session.execute(
            select(Offer)
            .options(selectinload(Offer.sender))
            .where(Offer.negotiation_id == negotiation_id)
            .order_by(Offer.timestamp.desc())
            .limit(1)
        )
        return result.scalars().first()
