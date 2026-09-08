import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.requirement import Requirement
from app.models.material import Material
from app.models.negotiation import Negotiation
from app.repositories.base import BaseRepository
from app.schemas.requirement import RequirementFilter


class RequirementRepository(BaseRepository[Requirement]):
    def __init__(self, session: AsyncSession):
        super().__init__(Requirement, session)

    async def get_by_id_detailed(self, requirement_id: uuid.UUID) -> Optional[Requirement]:
        result = await self.session.execute(
            select(Requirement)
            .options(
                selectinload(Requirement.material),
                selectinload(Requirement.company),
                selectinload(Requirement.negotiations).selectinload(Negotiation.transaction)
            )
            .where(Requirement.id == requirement_id)
        )
        return result.scalars().first()

    async def filter_requirements(
        self,
        company_id: Optional[uuid.UUID] = None,
        filters: Optional[RequirementFilter] = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Requirement], int]:
        query = select(Requirement).options(
            selectinload(Requirement.material),
            selectinload(Requirement.company),
            selectinload(Requirement.negotiations).selectinload(Negotiation.transaction)
        ).join(Requirement.material)

        if company_id:
            query = query.where(Requirement.company_id == company_id)

        if filters:
            if filters.material:
                query = query.where(Material.name.ilike(f"%{filters.material.strip()}%"))
            if filters.category:
                query = query.where(Material.category.ilike(f"%{filters.category.strip()}%"))
            if filters.location:
                query = query.where(Requirement.location.ilike(f"%{filters.location.strip()}%"))
            if filters.min_quantity is not None:
                query = query.where(Requirement.quantity_required >= filters.min_quantity)
            if filters.max_quantity is not None:
                query = query.where(Requirement.quantity_required <= filters.max_quantity)
            if filters.min_budget is not None:
                query = query.where(Requirement.budget_min >= filters.min_budget)
            if filters.max_budget is not None:
                query = query.where(Requirement.budget_max <= filters.max_budget)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        # Paginate ordered by creation time descending
        query = query.order_by(Requirement.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total
