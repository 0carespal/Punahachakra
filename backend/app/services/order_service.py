import uuid
from typing import List, Tuple
from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.order import Order, OrderStatus
from app.models.listing import ListingStatus
from app.models.user import User, UserRole
from app.repositories.order_repository import OrderRepository
from app.repositories.listing_repository import ListingRepository


class OrderService:
    def __init__(self, order_repo: OrderRepository, listing_repo: ListingRepository):
        self.order_repo = order_repo
        self.listing_repo = listing_repo

    async def get_order(self, order_id: uuid.UUID, current_user: User) -> Order:
        order = await self.order_repo.get_by_id_detailed(order_id)
        if not order:
            raise NotFoundException(f"Order with ID {order_id} not found")

        if current_user.id not in [order.seller_id, order.buyer_id] and current_user.role != UserRole.ADMIN:
            raise ForbiddenException("You are not authorized to view this order")

        return order

    async def get_my_orders(
        self, current_user: User, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Order], int]:
        return await self.order_repo.get_user_orders(current_user.id, skip=skip, limit=limit)

    async def update_order_status(
        self, order_id: uuid.UUID, current_user: User, new_status: OrderStatus
    ) -> Order:
        order = await self.get_order(order_id, current_user)

        order.status = new_status
        await self.order_repo.update(order, {"status": new_status})

        if new_status == OrderStatus.COMPLETED:
            listing = await self.listing_repo.get_by_id(order.listing_id)
            if listing:
                listing.status = ListingStatus.SOLD
                await self.listing_repo.update(listing, {"status": ListingStatus.SOLD})

        return await self.get_order(order_id, current_user)
