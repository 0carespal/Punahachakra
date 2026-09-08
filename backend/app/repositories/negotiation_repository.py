import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.negotiation import Negotiation, NegotiationStatus
from app.models.requirement import Requirement
from app.models.offer import Offer
from app.models.user import User, UserRole
from app.repositories.base import BaseRepository
from app.schemas.negotiation import NegotiationFilter


class NegotiationRepository(BaseRepository[Negotiation]):
    def __init__(self, session: AsyncSession):
        super().__init__(Negotiation, session)

    async def get_by_id_detailed(self, negotiation_id: uuid.UUID) -> Optional[Negotiation]:
        result = await self.session.execute(
            select(Negotiation)
            .options(
                selectinload(Negotiation.requirement).selectinload(Requirement.company),
                selectinload(Negotiation.requirement).selectinload(Requirement.material),
                selectinload(Negotiation.inventory),
                selectinload(Negotiation.offers).selectinload(Offer.sender).selectinload(User.kabadiwala_profile),
            )
            .where(Negotiation.id == negotiation_id)
        )
        return result.scalars().first()

    async def get_by_requirement_and_sender(
        self, requirement_id: uuid.UUID, sender_id: uuid.UUID
    ) -> Optional[Negotiation]:
        result = await self.session.execute(
            select(Negotiation)
            .options(
                selectinload(Negotiation.requirement).selectinload(Requirement.company),
                selectinload(Negotiation.requirement).selectinload(Requirement.material),
                selectinload(Negotiation.inventory),
                selectinload(Negotiation.offers).selectinload(Offer.sender),
            )
            .join(Negotiation.offers)
            .where(
                Negotiation.requirement_id == requirement_id,
                Offer.sender_id == sender_id
            )
        )
        return result.scalars().first()

    async def get_user_negotiations(
        self,
        user_id: uuid.UUID,
        company_profile_id: Optional[uuid.UUID] = None,
        kabadiwala_profile_id: Optional[uuid.UUID] = None,
        filters: Optional[NegotiationFilter] = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Negotiation], int]:
        query = select(Negotiation).options(
            selectinload(Negotiation.requirement).selectinload(Requirement.company),
            selectinload(Negotiation.requirement).selectinload(Requirement.material),
            selectinload(Negotiation.inventory),
            selectinload(Negotiation.offers).selectinload(Offer.sender).selectinload(User.kabadiwala_profile),
        )

        conditions = []
        if company_profile_id:
            query = query.join(Negotiation.requirement)
            conditions.append(Requirement.company_id == company_profile_id)
        elif kabadiwala_profile_id:
            # Kabadiwala is either sender of an offer or owns linked inventory
            query = query.outerjoin(Negotiation.offers)
            conditions.append(
                or_(
                    Offer.sender_id == user_id,
                    Negotiation.inventory.has(kabadiwala_id=kabadiwala_profile_id)
                )
            )

        if conditions:
            query = query.where(or_(*conditions))

        if filters:
            if filters.status:
                query = query.where(Negotiation.status == filters.status)
            if filters.requirement_id:
                query = query.where(Negotiation.requirement_id == filters.requirement_id)

        # Distinct negotiations
        query = query.distinct()

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        # Order by updated_at descending and paginate
        query = query.order_by(Negotiation.updated_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total
