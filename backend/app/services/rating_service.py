import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    DuplicateResourceException,
)
from app.models.rating import Rating
from app.models.user import User, UserRole, KabadiwalaProfile, CompanyProfile
from app.models.negotiation import Negotiation, NegotiationStatus
from app.models.transaction import Transaction
from app.repositories.rating_repository import RatingRepository
from app.repositories.user_repository import UserRepository
from app.schemas.rating import RatingCreate, RatingUpdate, KabadiwalaRatingSummary


class RatingService:
    def __init__(
        self,
        rating_repo: RatingRepository,
        user_repo: UserRepository,
    ):
        self.rating_repo = rating_repo
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

    async def _update_kabadiwala_average_rating(self, kabadiwala_id: uuid.UUID) -> float:
        avg_stars, count = await self.rating_repo.calculate_average_rating(kabadiwala_id)
        
        # Update profile
        result = await self.rating_repo.session.execute(
            select(KabadiwalaProfile).where(KabadiwalaProfile.id == kabadiwala_id)
        )
        profile = result.scalars().first()
        if profile:
            profile.average_rating = avg_stars
            self.rating_repo.session.add(profile)
            await self.rating_repo.session.flush()

        return avg_stars

    async def create_rating(
        self, current_user: User, rating_in: RatingCreate
    ) -> Rating:
        if current_user.role not in [UserRole.COMPANY, UserRole.ADMIN]:
            raise ForbiddenException("Only Companies or Admins can submit ratings and reviews for Kabadiwalas")

        company_profile = await self._get_or_create_company_profile(current_user)

        # Check target Kabadiwala profile exists
        result = await self.rating_repo.session.execute(
            select(KabadiwalaProfile).where(KabadiwalaProfile.id == rating_in.kabadiwala_id)
        )
        kabadiwala_profile = result.scalars().first()
        if not kabadiwala_profile:
            raise NotFoundException("Specified Kabadiwala profile not found")

        # Duplicate rating check
        if rating_in.transaction_id:
            # Check transaction exists
            tx_result = await self.rating_repo.session.execute(
                select(Transaction).where(Transaction.id == rating_in.transaction_id)
            )
            tx = tx_result.scalars().first()
            if not tx:
                raise NotFoundException("Specified completed transaction was not found")

            existing = await self.rating_repo.get_by_company_and_transaction(
                company_id=company_profile.id, transaction_id=rating_in.transaction_id
            )
            if existing:
                raise DuplicateResourceException("You have already submitted a rating for this transaction")
        else:
            existing = await self.rating_repo.get_by_company_and_kabadiwala(
                company_id=company_profile.id, kabadiwala_id=rating_in.kabadiwala_id
            )
            if existing:
                raise DuplicateResourceException("You have already rated this Kabadiwala. Use PUT endpoint to update rating.")

        rating_dict = {
            "company_id": company_profile.id,
            "kabadiwala_id": rating_in.kabadiwala_id,
            "transaction_id": rating_in.transaction_id,
            "stars": rating_in.stars,
            "review": rating_in.review,
        }

        created = await self.rating_repo.create(rating_dict)

        # Recalculate average rating for Kabadiwala
        await self._update_kabadiwala_average_rating(rating_in.kabadiwala_id)

        return await self.rating_repo.get_by_id_detailed(created.id)  # type: ignore

    async def get_rating(self, rating_id: uuid.UUID) -> Rating:
        rating = await self.rating_repo.get_by_id_detailed(rating_id)
        if not rating:
            raise NotFoundException(f"Rating with ID '{rating_id}' not found")
        return rating

    async def list_kabadiwala_ratings(
        self, kabadiwala_id: uuid.UUID, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Rating], int, KabadiwalaRatingSummary]:
        result = await self.rating_repo.session.execute(
            select(KabadiwalaProfile).where(KabadiwalaProfile.id == kabadiwala_id)
        )
        kab_profile = result.scalars().first()
        if not kab_profile:
            raise NotFoundException(f"Kabadiwala profile with ID '{kabadiwala_id}' not found")

        items, total = await self.rating_repo.get_kabadiwala_ratings(
            kabadiwala_id=kabadiwala_id, skip=skip, limit=limit
        )

        avg_stars, count = await self.rating_repo.calculate_average_rating(kabadiwala_id)
        summary = KabadiwalaRatingSummary(
            kabadiwala_id=kab_profile.id,
            kabadiwala_name=kab_profile.full_name,
            average_rating=avg_stars,
            total_ratings=count,
        )

        return items, total, summary

    async def list_my_given_ratings(
        self, current_user: User, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Rating], int]:
        if current_user.role not in [UserRole.COMPANY, UserRole.ADMIN]:
            raise ForbiddenException("Only Companies or Admins can view submitted ratings")

        company_profile = await self._get_or_create_company_profile(current_user)
        return await self.rating_repo.get_company_ratings(
            company_id=company_profile.id, skip=skip, limit=limit
        )

    async def update_rating(
        self, rating_id: uuid.UUID, current_user: User, rating_in: RatingUpdate
    ) -> Rating:
        rating = await self.get_rating(rating_id)

        company_profile = await self._get_or_create_company_profile(current_user)
        if rating.company_id != company_profile.id and current_user.role != UserRole.ADMIN:
            raise ForbiddenException("You can only edit your own ratings")

        if rating_in.stars is not None:
            rating.stars = rating_in.stars
        if rating_in.review is not None:
            rating.review = rating_in.review

        await self.rating_repo.session.flush()
        await self.rating_repo.session.refresh(rating)

        # Recalculate average rating
        await self._update_kabadiwala_average_rating(rating.kabadiwala_id)

        return await self.get_rating(rating_id)

    async def delete_rating(self, rating_id: uuid.UUID, current_user: User) -> bool:
        rating = await self.get_rating(rating_id)

        company_profile = await self._get_or_create_company_profile(current_user)
        if rating.company_id != company_profile.id and current_user.role != UserRole.ADMIN:
            raise ForbiddenException("You can only delete your own ratings")

        kab_id = rating.kabadiwala_id
        deleted = await self.rating_repo.delete(rating_id)

        # Recalculate average rating
        await self._update_kabadiwala_average_rating(kab_id)

        return deleted
