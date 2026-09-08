from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, categories, listings, bids, orders, inventory, requirements, negotiations, ratings, search

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(categories.router)
api_router.include_router(listings.router)
api_router.include_router(bids.router)
api_router.include_router(orders.router)
api_router.include_router(inventory.router)
api_router.include_router(requirements.router)
api_router.include_router(negotiations.router)
api_router.include_router(ratings.router)
api_router.include_router(search.router)
