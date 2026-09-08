import uuid
from typing import List, Optional, Tuple
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    BadRequestException,
)
from app.models.negotiation import Negotiation, NegotiationStatus
from app.models.offer import Offer
from app.models.user import User, UserRole, KabadiwalaProfile, CompanyProfile
from app.repositories.negotiation_repository import NegotiationRepository
from app.repositories.offer_repository import OfferRepository
from app.repositories.requirement_repository import RequirementRepository
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.user_repository import UserRepository
from app.schemas.negotiation import NegotiationCreate, NegotiationFilter
from app.schemas.offer import OfferCreate


class NegotiationService:
    def __init__(
        self,
        negotiation_repo: NegotiationRepository,
        offer_repo: OfferRepository,
        requirement_repo: RequirementRepository,
        inventory_repo: InventoryRepository,
        user_repo: UserRepository,
    ):
        self.negotiation_repo = negotiation_repo
        self.offer_repo = offer_repo
        self.requirement_repo = requirement_repo
        self.inventory_repo = inventory_repo
        self.user_repo = user_repo

    async def initiate_negotiation(
        self, current_user: User, negotiation_in: NegotiationCreate
    ) -> Negotiation:
        if current_user.role not in [UserRole.KABADIWALA, UserRole.ADMIN]:
            raise ForbiddenException("Only Kabadiwalas or Admins can initiate a negotiation on a requirement")

        requirement = await self.requirement_repo.get_by_id_detailed(negotiation_in.requirement_id)
        if not requirement:
            raise NotFoundException(f"Requirement with ID '{negotiation_in.requirement_id}' not found")

        # Verify or create kabadiwala profile
        if not current_user.kabadiwala_profile:
            profile = KabadiwalaProfile(
                user_id=current_user.id,
                full_name=current_user.email.split("@")[0].capitalize(),
                location="India",
            )
            await self.user_repo.create_kabadiwala_profile(profile)
            current_user.kabadiwala_profile = profile

        # Check existing negotiation
        existing = await self.negotiation_repo.get_by_requirement_and_sender(
            requirement_id=requirement.id, sender_id=current_user.id
        )

        if existing and existing.status in [NegotiationStatus.PENDING, NegotiationStatus.ACTIVE]:
            # Append new offer to existing active/pending negotiation
            offer_dict = {
                "negotiation_id": existing.id,
                "sender_id": current_user.id,
                "offered_price": negotiation_in.offered_price,
                "offered_quantity": negotiation_in.offered_quantity or requirement.quantity_required,
                "message": negotiation_in.message or "Initial offer updated",
            }
            await self.offer_repo.create(offer_dict)
            existing.status = NegotiationStatus.PENDING
            await self.negotiation_repo.session.flush()
            await self.negotiation_repo.session.refresh(existing)
            return await self.negotiation_repo.get_by_id_detailed(existing.id)  # type: ignore

        # Create new Negotiation record
        neg_dict = {
            "requirement_id": requirement.id,
            "inventory_id": negotiation_in.inventory_id,
            "status": NegotiationStatus.PENDING,
        }
        negotiation = await self.negotiation_repo.create(neg_dict)

        # Create initial Offer in history
        offer_dict = {
            "negotiation_id": negotiation.id,
            "sender_id": current_user.id,
            "offered_price": negotiation_in.offered_price,
            "offered_quantity": negotiation_in.offered_quantity or requirement.quantity_required,
            "message": negotiation_in.message or "Initiated requirement response",
        }
        await self.offer_repo.create(offer_dict)

        return await self.negotiation_repo.get_by_id_detailed(negotiation.id)  # type: ignore

    async def send_offer(
        self, negotiation_id: uuid.UUID, current_user: User, offer_in: OfferCreate
    ) -> Negotiation:
        negotiation = await self.negotiation_repo.get_by_id_detailed(negotiation_id)
        if not negotiation:
            raise NotFoundException(f"Negotiation with ID '{negotiation_id}' not found")

        if negotiation.status in [NegotiationStatus.ACCEPTED, NegotiationStatus.REJECTED, NegotiationStatus.COMPLETED, NegotiationStatus.CANCELLED]:
            raise BadRequestException(f"Cannot submit offer on negotiation with status '{negotiation.status.value}'")

        # Authorization check: must be requirement owner or offer sender/kabadiwala or admin
        self._verify_participant(negotiation, current_user)

        # Add counter-offer entry to offer history
        default_qty = negotiation.requirement.quantity_required if negotiation.requirement else None
        offer_dict = {
            "negotiation_id": negotiation.id,
            "sender_id": current_user.id,
            "offered_price": offer_in.offered_price,
            "offered_quantity": offer_in.offered_quantity or default_qty,
            "message": offer_in.message,
        }
        await self.offer_repo.create(offer_dict)

        # Update status to ACTIVE
        negotiation.status = NegotiationStatus.ACTIVE
        await self.negotiation_repo.session.flush()
        await self.negotiation_repo.session.refresh(negotiation)

        return await self.negotiation_repo.get_by_id_detailed(negotiation.id)  # type: ignore

    async def accept_offer(
        self, negotiation_id: uuid.UUID, current_user: User
    ) -> Negotiation:
        negotiation = await self.negotiation_repo.get_by_id_detailed(negotiation_id)
        if not negotiation:
            raise NotFoundException(f"Negotiation with ID '{negotiation_id}' not found")

        if negotiation.status in [NegotiationStatus.ACCEPTED, NegotiationStatus.COMPLETED]:
            return negotiation

        if negotiation.status in [NegotiationStatus.REJECTED, NegotiationStatus.CANCELLED]:
            raise BadRequestException(f"Cannot accept negotiation with status '{negotiation.status.value}'")

        self._verify_participant(negotiation, current_user)

        negotiation.status = NegotiationStatus.ACCEPTED
        await self.negotiation_repo.session.flush()
        await self.negotiation_repo.session.refresh(negotiation)

        return await self.negotiation_repo.get_by_id_detailed(negotiation.id)  # type: ignore

    async def reject_offer(
        self, negotiation_id: uuid.UUID, current_user: User, message: Optional[str] = None
    ) -> Negotiation:
        negotiation = await self.negotiation_repo.get_by_id_detailed(negotiation_id)
        if not negotiation:
            raise NotFoundException(f"Negotiation with ID '{negotiation_id}' not found")

        if negotiation.status in [NegotiationStatus.COMPLETED]:
            raise BadRequestException("Cannot reject a completed negotiation deal")

        self._verify_participant(negotiation, current_user)

        if message:
            latest_offer = await self.offer_repo.get_latest_offer(negotiation.id)
            price = latest_offer.offered_price if latest_offer else 0.0
            offer_dict = {
                "negotiation_id": negotiation.id,
                "sender_id": current_user.id,
                "offered_price": price,
                "message": f"Rejected: {message}",
            }
            await self.offer_repo.create(offer_dict)

        negotiation.status = NegotiationStatus.REJECTED
        await self.negotiation_repo.session.flush()
        await self.negotiation_repo.session.refresh(negotiation)

        return await self.negotiation_repo.get_by_id_detailed(negotiation.id)  # type: ignore

    async def complete_negotiation(
        self, negotiation_id: uuid.UUID, current_user: User
    ) -> Negotiation:
        negotiation = await self.negotiation_repo.get_by_id_detailed(negotiation_id)
        if not negotiation:
            raise NotFoundException(f"Negotiation with ID '{negotiation_id}' not found")

        if negotiation.status != NegotiationStatus.ACCEPTED:
            raise BadRequestException("Only accepted negotiations can be marked as completed")

        self._verify_participant(negotiation, current_user)

        negotiation.status = NegotiationStatus.COMPLETED
        await self.negotiation_repo.session.flush()
        await self.negotiation_repo.session.refresh(negotiation)

        return await self.negotiation_repo.get_by_id_detailed(negotiation.id)  # type: ignore

    async def get_negotiation(
        self, negotiation_id: uuid.UUID, current_user: User
    ) -> Negotiation:
        negotiation = await self.negotiation_repo.get_by_id_detailed(negotiation_id)
        if not negotiation:
            raise NotFoundException(f"Negotiation with ID '{negotiation_id}' not found")

        self._verify_participant(negotiation, current_user)
        return negotiation

    async def list_my_negotiations(
        self,
        current_user: User,
        filters: Optional[NegotiationFilter] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Negotiation], int]:
        comp_profile_id = current_user.company_profile.id if current_user.company_profile else None
        kab_profile_id = current_user.kabadiwala_profile.id if current_user.kabadiwala_profile else None

        if current_user.role == UserRole.ADMIN:
            comp_profile_id = None
            kab_profile_id = None

        return await self.negotiation_repo.get_user_negotiations(
            user_id=current_user.id,
            company_profile_id=comp_profile_id,
            kabadiwala_profile_id=kab_profile_id,
            filters=filters,
            skip=skip,
            limit=limit,
        )

    def _verify_participant(self, negotiation: Negotiation, user: User) -> None:
        if user.role == UserRole.ADMIN:
            return

        is_company_owner = (
            negotiation.requirement and negotiation.requirement.company and
            negotiation.requirement.company.user_id == user.id
        )
        is_offer_participant = any(offer.sender_id == user.id for offer in negotiation.offers)
        is_inventory_owner = (
            negotiation.inventory and negotiation.inventory.kabadiwala and
            negotiation.inventory.kabadiwala.user_id == user.id
        )

        if not (is_company_owner or is_offer_participant or is_inventory_owner):
            raise ForbiddenException("You are not authorized to view or negotiate on this transaction")
