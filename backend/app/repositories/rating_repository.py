import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.rating import Rating
from app.repositories.base import BaseRepository


class RatingRepository(BaseRepository[Rating]):
    def __init__(self, session: AsyncSession):
        super().__init__(Rating, session)

    async def get_by_id_detailed(self, rating_id: uuid.UUID) -> Optional[Rating]:
        result = await self.session.execute(
            select(Rating)
            .options(
                selectinload(Rating.company),
                selectinload(Rating.kabadiwala),
                selectinload(Rating.transaction)
            )
            .where(Rating.id == rating_id)
        )
        return result.scalars().first()

    async def get_by_company_and_transaction(
        self, company_id: uuid.UUID, transaction_id: uuid.UUID
    ) -> Optional[Rating]:
        result = await self.session.execute(
            select(Rating).where(
                Rating.company_id == company_id,
                Rating.transaction_id == transaction_id
            )
        )
        return result.scalars().first()

    async def get_by_company_and_kabadiwala(
        self, company_id: uuid.UUID, kabadiwala_id: uuid.UUID
    ) -> Optional[Rating]:
        result = await self.session.execute(
            select(Rating).where(
                Rating.company_id == company_id,
                Rating.kabadiwala_id == kabadiwala_id
            )
        )
        return result.scalars().first()

    async def get_kabadiwala_ratings(
        self, kabadiwala_id: uuid.UUID, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Rating], int]:
        query = select(Rating).options(
            selectinload(Rating.company),
            selectinload(Rating.kabadiwala)
        ).where(Rating.kabadiwala_id == kabadiwala_id)

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(Rating.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_company_ratings(
        self, company_id: uuid.UUID, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Rating], int]:
        query = select(Rating).options(
            selectinload(Rating.company),
            selectinload(Rating.kabadiwala)
        ).where(Rating.company_id == company_id)

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(Rating.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def calculate_average_rating(self, kabadiwala_id: uuid.UUID) -> Tuple[float, int]:
        result = await self.session.execute(
            select(
                func.coalesce(func.avg(Rating.stars), 0.0),
                func.count(Rating.id)
            ).where(Rating.kabadiwala_id == kabadiwala_id)
        )
        avg_stars, total_count = result.one()
        return round(float(avg_stars), 2), int(total_count)
