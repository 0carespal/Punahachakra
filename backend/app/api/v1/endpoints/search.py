import math
from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.api.deps import get_ranking_service
from app.schemas.common import PaginatedResponse
from app.schemas.ranking import RankedKabadiwalaResponse, SellerSearchQuery
from app.services.ranking_service import RankingService

router = APIRouter(prefix="/search", tags=["Seller Search & Ranking Engine"])


@router.get(
    "/kabadiwalas",
    response_model=PaginatedResponse[RankedKabadiwalaResponse],
    summary="Search Kabadiwalas ranked by Visibility Score (descending)",
)
async def search_kabadiwalas(
    material: Optional[str] = Query(None, description="Search by material name (e.g., Copper Wire, Cardboard)"),
    category: Optional[str] = Query(None, description="Search by category name (e.g., Non-Ferrous Metals, Paper)"),
    location: Optional[str] = Query(None, description="Search by location string (e.g., Bengaluru, Indiranagar)"),
    latitude: Optional[float] = Query(None, description="Search origin latitude coordinate"),
    longitude: Optional[float] = Query(None, description="Search origin longitude coordinate"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    ranking_service: RankingService = Depends(get_ranking_service),
):
    query = SellerSearchQuery(
        material=material,
        category=category,
        location=location,
        latitude=latitude,
        longitude=longitude,
    )
    skip = (page - 1) * page_size
    items, total = await ranking_service.search_and_rank_kabadiwalas(
        query=query, skip=skip, limit=page_size
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )
