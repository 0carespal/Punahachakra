import math
from typing import List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import KabadiwalaProfile
from app.models.inventory import Inventory
from app.schemas.ranking import (
    RankedKabadiwalaResponse,
    KabadiwalaInventorySummary,
    SellerSearchQuery,
)
from app.utils.ranking import (
    calculate_material_match,
    estimate_location_distance_km,
    calculate_distance_score,
    calculate_rating_score,
    calculate_visibility_score,
)


class RankingService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def search_and_rank_kabadiwalas(
        self,
        query: SellerSearchQuery,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[RankedKabadiwalaResponse], int]:
        # Query all Kabadiwalas with inventories and materials eager loaded
        result = await self.session.execute(
            select(KabadiwalaProfile).options(
                selectinload(KabadiwalaProfile.inventories).selectinload(Inventory.material)
            )
        )
        kabadiwalas = list(result.scalars().all())

        ranked_list: List[RankedKabadiwalaResponse] = []

        for kab in kabadiwalas:
            # Extract inventory items list of tuples (name, category)
            inventory_tuples = []
            inv_summaries = []

            for inv in kab.inventories:
                mat_name = inv.material.name if inv.material else ""
                cat_name = inv.material.category if inv.material else ""
                inventory_tuples.append((mat_name, cat_name))

                inv_summaries.append(
                    KabadiwalaInventorySummary(
                        material_name=mat_name,
                        category=cat_name,
                        quantity=inv.quantity,
                        price_range_min=inv.price_range_min,
                        price_range_max=inv.price_range_max,
                    )
                )

            # 1. MaterialMatch Score
            mat_match_score = calculate_material_match(
                requested_material=query.material,
                requested_category=query.category,
                inventory_items=inventory_tuples,
            )

            # 2. Distance Calculation & DistanceScore
            dist_km = estimate_location_distance_km(
                loc1=query.location,
                loc2=kab.location,
                lat1=query.latitude,
                lon1=query.longitude,
            )
            dist_score = calculate_distance_score(dist_km)

            # 3. RatingScore
            rating_score = calculate_rating_score(kab.average_rating)

            # 4. Visibility Score
            vis_score = calculate_visibility_score(
                material_match=mat_match_score,
                distance_score=dist_score,
                rating_score=rating_score,
            )

            # Persist updated visibility score on model
            kab.visibility_score = vis_score
            self.session.add(kab)

            ranked_response = RankedKabadiwalaResponse(
                kabadiwala_id=kab.id,
                user_id=kab.user_id,
                full_name=kab.full_name,
                location=kab.location,
                average_rating=kab.average_rating,
                visibility_score=vis_score,
                material_match_score=mat_match_score,
                distance_km=round(dist_km, 2),
                distance_score=dist_score,
                rating_score=rating_score,
                inventories=inv_summaries,
            )
            ranked_list.append(ranked_response)

        # Flush database changes for visibility scores
        await self.session.flush()

        # Sort Kabadiwalas by visibility_score DESCENDING
        ranked_list.sort(key=lambda k: k.visibility_score, reverse=True)

        total = len(ranked_list)
        paginated_items = ranked_list[skip : skip + limit]

        return paginated_items, total
