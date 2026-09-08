import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.listing import Listing, ListingStatus
from app.repositories.base import BaseRepository
from app.schemas.listing import ListingFilter


class ListingRepository(BaseRepository[Listing]):
    def __init__(self, session: AsyncSession):
        super().__init__(Listing, session)

    async def get_by_id_detailed(self, listing_id: uuid.UUID) -> Optional[Listing]:
        result = await self.session.execute(
            select(Listing)
            .options(
                selectinload(Listing.seller),
                selectinload(Listing.category)
            )
            .where(Listing.id == listing_id)
        )
        return result.scalars().first()

    async def filter_listings(
        self,
        filters: ListingFilter,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Listing], int]:
        query = select(Listing).options(
            selectinload(Listing.seller),
            selectinload(Listing.category)
        )

        if filters.status:
            query = query.where(Listing.status == filters.status)
        if filters.category_id:
            query = query.where(Listing.category_id == filters.category_id)
        if filters.city:
            query = query.where(Listing.city.ilike(f"%{filters.city}%"))
        if filters.state:
            query = query.where(Listing.state.ilike(f"%{filters.state}%"))
        if filters.min_price is not None:
            query = query.where(Listing.price_per_unit >= filters.min_price)
        if filters.max_price is not None:
            query = query.where(Listing.price_per_unit <= filters.max_price)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        # Paginate
        query = query.order_by(Listing.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_seller(
        self, seller_id: uuid.UUID, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Listing], int]:
        query = select(Listing).options(
            selectinload(Listing.seller),
            selectinload(Listing.category)
        ).where(Listing.seller_id == seller_id)

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(Listing.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total
