import uuid
from typing import AsyncGenerator, Callable, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_token
from app.db.session import get_async_session
from app.models.user import User, UserRole
from app.repositories import (
    BidRepository,
    CategoryRepository,
    InventoryRepository,
    ListingRepository,
    MaterialRepository,
    NegotiationRepository,
    OfferRepository,
    OrderRepository,
    RatingRepository,
    RequirementRepository,
    UserRepository,
)
from app.services import (
    AuthService,
    BidService,
    CategoryService,
    InventoryService,
    ListingService,
    NegotiationService,
    OrderService,
    RatingService,
    RequirementService,
    UserService,
    RankingService,
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


# DB Session dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_async_session():
        yield session


# Repository Factories
def get_user_repository(session: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(session)


def get_category_repository(session: AsyncSession = Depends(get_db)) -> CategoryRepository:
    return CategoryRepository(session)


def get_listing_repository(session: AsyncSession = Depends(get_db)) -> ListingRepository:
    return ListingRepository(session)


def get_bid_repository(session: AsyncSession = Depends(get_db)) -> BidRepository:
    return BidRepository(session)


def get_order_repository(session: AsyncSession = Depends(get_db)) -> OrderRepository:
    return OrderRepository(session)


def get_inventory_repository(session: AsyncSession = Depends(get_db)) -> InventoryRepository:
    return InventoryRepository(session)


def get_material_repository(session: AsyncSession = Depends(get_db)) -> MaterialRepository:
    return MaterialRepository(session)


def get_requirement_repository(session: AsyncSession = Depends(get_db)) -> RequirementRepository:
    return RequirementRepository(session)


def get_offer_repository(session: AsyncSession = Depends(get_db)) -> OfferRepository:
    return OfferRepository(session)


def get_negotiation_repository(session: AsyncSession = Depends(get_db)) -> NegotiationRepository:
    return NegotiationRepository(session)


def get_rating_repository(session: AsyncSession = Depends(get_db)) -> RatingRepository:
    return RatingRepository(session)


# Service Factories
def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository)
) -> AuthService:
    return AuthService(user_repo)


def get_user_service(
    user_repo: UserRepository = Depends(get_user_repository)
) -> UserService:
    return UserService(user_repo)


def get_category_service(
    category_repo: CategoryRepository = Depends(get_category_repository)
) -> CategoryService:
    return CategoryService(category_repo)


def get_listing_service(
    listing_repo: ListingRepository = Depends(get_listing_repository),
    category_repo: CategoryRepository = Depends(get_category_repository)
) -> ListingService:
    return ListingService(listing_repo, category_repo)


def get_bid_service(
    bid_repo: BidRepository = Depends(get_bid_repository),
    listing_repo: ListingRepository = Depends(get_listing_repository),
    order_repo: OrderRepository = Depends(get_order_repository)
) -> BidService:
    return BidService(bid_repo, listing_repo, order_repo)


def get_order_service(
    order_repo: OrderRepository = Depends(get_order_repository),
    listing_repo: ListingRepository = Depends(get_listing_repository)
) -> OrderService:
    return OrderService(order_repo, listing_repo)


def get_inventory_service(
    inventory_repo: InventoryRepository = Depends(get_inventory_repository),
    material_repo: MaterialRepository = Depends(get_material_repository),
    user_repo: UserRepository = Depends(get_user_repository),
) -> InventoryService:
    return InventoryService(inventory_repo, material_repo, user_repo)


def get_requirement_service(
    requirement_repo: RequirementRepository = Depends(get_requirement_repository),
    material_repo: MaterialRepository = Depends(get_material_repository),
    user_repo: UserRepository = Depends(get_user_repository),
) -> RequirementService:
    return RequirementService(requirement_repo, material_repo, user_repo)


def get_negotiation_service(
    negotiation_repo: NegotiationRepository = Depends(get_negotiation_repository),
    offer_repo: OfferRepository = Depends(get_offer_repository),
    requirement_repo: RequirementRepository = Depends(get_requirement_repository),
    inventory_repo: InventoryRepository = Depends(get_inventory_repository),
    user_repo: UserRepository = Depends(get_user_repository),
) -> NegotiationService:
    return NegotiationService(negotiation_repo, offer_repo, requirement_repo, inventory_repo, user_repo)


def get_rating_service(
    rating_repo: RatingRepository = Depends(get_rating_repository),
    user_repo: UserRepository = Depends(get_user_repository),
) -> RatingService:
    return RatingService(rating_repo, user_repo)


def get_ranking_service(
    session: AsyncSession = Depends(get_db),
) -> RankingService:
    return RankingService(session)


# Authentication Dependencies
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_repo: UserRepository = Depends(get_user_repository)
) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedException("Invalid authentication token")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedException("Invalid token payload")

    try:
        user_id = uuid.UUID(str(user_id_str))
    except ValueError:
        raise UnauthorizedException("Invalid user ID format in token payload")

    user = await user_repo.get_with_profile(user_id)
    if not user:
        raise UnauthorizedException("User not found")

    if not user.is_active:
        raise ForbiddenException("User account is inactive")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    return current_user


def require_role(allowed_roles: List[UserRole]) -> Callable:
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenException(
                f"User role '{current_user.role.value}' is not authorized to access this resource"
            )
        return current_user
    return role_checker
