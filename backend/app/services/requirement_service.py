import uuid
from typing import List, Optional, Tuple
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    BadRequestException,
)
from app.models.requirement import Requirement
from app.models.user import User, UserRole, CompanyProfile
from app.repositories.requirement_repository import RequirementRepository
from app.repositories.material_repository import MaterialRepository
from app.repositories.user_repository import UserRepository
from app.schemas.requirement import (
    RequirementCreate,
    RequirementUpdate,
    RequirementFilter,
)


class RequirementService:
    def __init__(
        self,
        requirement_repo: RequirementRepository,
        material_repo: MaterialRepository,
        user_repo: UserRepository,
    ):
        self.requirement_repo = requirement_repo
        self.material_repo = material_repo
        self.user_repo = user_repo

    async def _get_or_create_company_profile(self, user: User) -> CompanyProfile:
        if user.company_profile:
            return user.company_profile

        profile = CompanyProfile(
            user_id=user.id,
            company_name=f"{user.email.split('@')[0].capitalize()} Recycling Ltd",
            location="India",
        )
        profile = await self.user_repo.create_company_profile(profile)
        user.company_profile = profile
        return profile

    async def create_requirement(
        self, current_user: User, requirement_in: RequirementCreate
    ) -> Requirement:
        if current_user.role not in [UserRole.COMPANY, UserRole.ADMIN]:
            raise ForbiddenException("Only Companies or Admins can create scrap requirements")

        profile = await self._get_or_create_company_profile(current_user)

        # Resolve material
        if requirement_in.material_id:
            material = await self.material_repo.get_by_id(requirement_in.material_id)
            if not material:
                raise NotFoundException("Specified material was not found")
        elif requirement_in.material_name:
            cat_name = requirement_in.category or "General Scrap"
            material = await self.material_repo.get_or_create(
                name=requirement_in.material_name, category=cat_name
            )
        else:
            raise BadRequestException("Either material_name or material_id must be provided")

        location = requirement_in.location or profile.location or "India"

        req_dict = {
            "company_id": profile.id,
            "material_id": material.id,
            "quantity_required": requirement_in.quantity_required,
            "budget_min": requirement_in.budget_min,
            "budget_max": requirement_in.budget_max,
            "description": requirement_in.description,
            "location": location,
        }

        created = await self.requirement_repo.create(req_dict)
        return await self.requirement_repo.get_by_id_detailed(created.id)  # type: ignore

    async def get_requirement(self, requirement_id: uuid.UUID) -> Requirement:
        requirement = await self.requirement_repo.get_by_id_detailed(requirement_id)
        if not requirement:
            raise NotFoundException(f"Requirement with ID '{requirement_id}' not found")
        return requirement

    async def get_my_requirements(
        self,
        current_user: User,
        filters: Optional[RequirementFilter] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Requirement], int]:
        if current_user.role not in [UserRole.COMPANY, UserRole.ADMIN]:
            raise ForbiddenException("Only Companies or Admins can view company requirements")

        profile = await self._get_or_create_company_profile(current_user)
        return await self.requirement_repo.filter_requirements(
            company_id=profile.id, filters=filters, skip=skip, limit=limit
        )

    async def list_requirements(
        self,
        filters: Optional[RequirementFilter] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Requirement], int]:
        return await self.requirement_repo.filter_requirements(
            company_id=None, filters=filters, skip=skip, limit=limit
        )

    async def update_requirement(
        self,
        requirement_id: uuid.UUID,
        current_user: User,
        requirement_in: RequirementUpdate,
    ) -> Requirement:
        requirement = await self.get_requirement(requirement_id)

        profile = await self._get_or_create_company_profile(current_user)
        if requirement.company_id != profile.id and current_user.role != UserRole.ADMIN:
            raise ForbiddenException("You can only edit your own company requirements")

        # Validate budget range if updating bounds
        new_min = (
            requirement_in.budget_min
            if requirement_in.budget_min is not None
            else requirement.budget_min
        )
        new_max = (
            requirement_in.budget_max
            if requirement_in.budget_max is not None
            else requirement.budget_max
        )
        if new_max < new_min:
            raise BadRequestException(
                f"budget_max ({new_max}) cannot be less than budget_min ({new_min})"
            )

        # Handle material change if requested
        if requirement_in.material_id:
            material = await self.material_repo.get_by_id(requirement_in.material_id)
            if not material:
                raise NotFoundException("Specified material was not found")
            requirement.material_id = material.id
        elif requirement_in.material_name:
            cat_name = (
                requirement_in.category
                or (requirement.material.category if requirement.material else "General Scrap")
            )
            material = await self.material_repo.get_or_create(
                name=requirement_in.material_name, category=cat_name
            )
            requirement.material_id = material.id
        elif requirement_in.category and requirement.material:
            material = await self.material_repo.get_or_create(
                name=requirement.material.name, category=requirement_in.category
            )
            requirement.material_id = material.id

        if requirement_in.quantity_required is not None:
            requirement.quantity_required = requirement_in.quantity_required
        if requirement_in.budget_min is not None:
            requirement.budget_min = requirement_in.budget_min
        if requirement_in.budget_max is not None:
            requirement.budget_max = requirement_in.budget_max
        if requirement_in.description is not None:
            requirement.description = requirement_in.description
        if requirement_in.location is not None:
            requirement.location = requirement_in.location

        await self.requirement_repo.session.flush()
        await self.requirement_repo.session.refresh(requirement)
        return await self.get_requirement(requirement_id)

    async def delete_requirement(
        self, requirement_id: uuid.UUID, current_user: User
    ) -> bool:
        requirement = await self.get_requirement(requirement_id)

        profile = await self._get_or_create_company_profile(current_user)
        if requirement.company_id != profile.id and current_user.role != UserRole.ADMIN:
            raise ForbiddenException("You can only delete your own company requirements")

        return await self.requirement_repo.delete(requirement_id)
