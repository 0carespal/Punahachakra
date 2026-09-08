import uuid
from typing import List, Tuple
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.models.bid import Bid, BidStatus
from app.models.listing import ListingStatus
from app.models.order import Order, OrderStatus
from app.models.user import User, UserRole
from app.repositories.bid_repository import BidRepository
from app.repositories.listing_repository import ListingRepository
from app.repositories.order_repository import OrderRepository
from app.schemas.bid import BidCreate


class BidService:
    def __init__(
        self,
        bid_repo: BidRepository,
        listing_repo: ListingRepository,
        order_repo: OrderRepository
    ):
        self.bid_repo = bid_repo
        self.listing_repo = listing_repo
        self.order_repo = order_repo

    async def create_bid(self, current_user: User, bid_in: BidCreate) -> Bid:
        if current_user.role not in [UserRole.COMPANY, UserRole.ADMIN]:
            raise ForbiddenException("Only Companies or Admins can submit bids")

        listing = await self.listing_repo.get_by_id(bid_in.listing_id)
        if not listing:
            raise NotFoundException("Listing not found")

        if listing.status != ListingStatus.ACTIVE:
            raise BadRequestException("Cannot bid on an inactive or closed listing")

        if listing.seller_id == current_user.id:
            raise BadRequestException("You cannot bid on your own listing")

        bid_dict = bid_in.model_dump()
        bid_dict["buyer_id"] = current_user.id
        bid_dict["status"] = BidStatus.PENDING

        created_bid = await self.bid_repo.create(bid_dict)
        return await self.bid_repo.get_by_id_detailed(created_bid.id)  # type: ignore

    async def get_bid(self, bid_id: uuid.UUID) -> Bid:
        bid = await self.bid_repo.get_by_id_detailed(bid_id)
        if not bid:
            raise NotFoundException(f"Bid with ID {bid_id} not found")
        return bid

    async def get_listing_bids(
        self, listing_id: uuid.UUID, current_user: User, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Bid], int]:
        listing = await self.listing_repo.get_by_id(listing_id)
        if not listing:
            raise NotFoundException("Listing not found")

        if listing.seller_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise ForbiddenException("Only the seller or admin can view bids for this listing")

        return await self.bid_repo.get_by_listing(listing_id, skip=skip, limit=limit)

    async def get_my_bids(
        self, current_user: User, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Bid], int]:
        return await self.bid_repo.get_by_buyer(current_user.id, skip=skip, limit=limit)

    async def respond_to_bid(
        self, bid_id: uuid.UUID, current_user: User, new_status: BidStatus
    ) -> Bid:
        bid = await self.get_bid(bid_id)
        listing = await self.listing_repo.get_by_id(bid.listing_id)
        if not listing:
            raise NotFoundException("Listing not found")

        if listing.seller_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise ForbiddenException("Only the listing seller can respond to bids")

        if bid.status != BidStatus.PENDING:
            raise BadRequestException(f"Bid status is already {bid.status.value}")

        bid.status = new_status
        await self.bid_repo.update(bid, {"status": new_status})

        if new_status == BidStatus.ACCEPTED:
            # Change listing status to PENDING_DEAL
            listing.status = ListingStatus.PENDING_DEAL
            await self.listing_repo.update(listing, {"status": ListingStatus.PENDING_DEAL})

            # Create Order automatically
            order_dict = {
                "listing_id": listing.id,
                "bid_id": bid.id,
                "seller_id": listing.seller_id,
                "buyer_id": bid.buyer_id,
                "total_price": bid.total_amount,
                "status": OrderStatus.INITIATED
            }
            await self.order_repo.create(order_dict)

        return await self.get_bid(bid_id)
