import uuid
from typing import List, Tuple
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.models.listing import Listing, ListingStatus
from app.models.user import User, UserRole
from app.repositories.listing_repository import ListingRepository
from app.repositories.category_repository import CategoryRepository
from app.schemas.listing import ListingCreate, ListingUpdate, ListingFilter


class ListingService:
    def __init__(
        self,
        listing_repo: ListingRepository,
        category_repo: CategoryRepository
    ):
        self.listing_repo = listing_repo
        self.category_repo = category_repo

    async def create_listing(self, current_user: User, listing_in: ListingCreate) -> Listing:
        if current_user.role not in [UserRole.KABADIWALA, UserRole.ADMIN]:
            raise ForbiddenException("Only Kabadiwalas or Admins can create scrap listings")

        category = await self.category_repo.get_by_id(listing_in.category_id)
        if not category:
            raise NotFoundException("Category not found")

        listing_dict = listing_in.model_dump()
        listing_dict["seller_id"] = current_user.id
        listing_dict["status"] = ListingStatus.ACTIVE

        created = await self.listing_repo.create(listing_dict)
        return await self.listing_repo.get_by_id_detailed(created.id)  # type: ignore

    async def get_listing(self, listing_id: uuid.UUID) -> Listing:
        listing = await self.listing_repo.get_by_id_detailed(listing_id)
        if not listing:
            raise NotFoundException(f"Listing with ID {listing_id} not found")
        return listing

    async def filter_listings(
        self, filters: ListingFilter, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Listing], int]:
        return await self.listing_repo.filter_listings(filters, skip=skip, limit=limit)

    async def get_my_listings(
        self, current_user: User, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Listing], int]:
        return await self.listing_repo.get_by_seller(current_user.id, skip=skip, limit=limit)

    async def update_listing(
        self, listing_id: uuid.UUID, current_user: User, listing_in: ListingUpdate
    ) -> Listing:
        listing = await self.get_listing(listing_id)
        if listing.seller_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise ForbiddenException("You can only edit your own listings")

        if listing_in.category_id:
            category = await self.category_repo.get_by_id(listing_in.category_id)
            if not category:
                raise NotFoundException("Category not found")

        await self.listing_repo.update(listing, listing_in)
        return await self.get_listing(listing_id)

    async def delete_listing(self, listing_id: uuid.UUID, current_user: User) -> bool:
        listing = await self.get_listing(listing_id)
        if listing.seller_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise ForbiddenException("You can only delete your own listings")

        return await self.listing_repo.delete(listing_id)
