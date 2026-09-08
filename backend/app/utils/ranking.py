import math
from typing import List, Optional, Tuple


def calculate_haversine_distance(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Calculate the Great Circle distance between two points on Earth in kilometers using Haversine formula."""
    R = 6371.0  # Radius of Earth in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def estimate_location_distance_km(
    loc1: Optional[str],
    loc2: Optional[str],
    lat1: Optional[float] = None,
    lon1: Optional[float] = None,
    lat2: Optional[float] = None,
    lon2: Optional[float] = None,
) -> float:
    """Estimate distance in km using coordinates if available, otherwise using location string matching heuristics."""
    if (
        lat1 is not None
        and lon1 is not None
        and lat2 is not None
        and lon2 is not None
    ):
        return calculate_haversine_distance(lat1, lon1, lat2, lon2)

    if not loc1 or not loc2:
        return 15.0  # Default fallback distance (gives 0.6 distance score)

    l1 = loc1.strip().lower()
    l2 = loc2.strip().lower()

    if l1 == l2 or l1 in l2 or l2 in l1:
        return 3.0  # Same city/neighborhood -> 0-5km range (score 1.0)

    # Check for common location tokens
    words1 = set(l1.replace(",", " ").split())
    words2 = set(l2.replace(",", " ").split())
    if words1.intersection(words2):
        return 7.0  # Nearby area in same city -> 5-10km range (score 0.8)

    return 25.0  # Different location -> 20-50km range (score 0.4)


def calculate_material_match(
    requested_material: Optional[str],
    requested_category: Optional[str],
    inventory_items: List[Tuple[str, str]],  # List of (material_name, category)
) -> float:
    """Calculate MaterialMatch score:
    - 1.0 for Exact Match
    - 0.7 for Partial Match
    - 0.0 for No Match
    """
    if not requested_material and not requested_category:
        return 0.7  # Broad search default score

    req_mat = requested_material.strip().lower() if requested_material else ""
    req_cat = requested_category.strip().lower() if requested_category else ""

    best_match = 0.0

    for mat_name, cat_name in inventory_items:
        m_name = mat_name.strip().lower() if mat_name else ""
        c_name = cat_name.strip().lower() if cat_name else ""

        # Exact Match check on material name
        if req_mat and req_mat == m_name:
            return 1.0

        # Partial Match check on material name or category
        if req_mat and (req_mat in m_name or m_name in req_mat):
            best_match = max(best_match, 0.7)

        if req_cat and (req_cat == c_name or req_cat in c_name or c_name in req_cat):
            best_match = max(best_match, 0.7)

    return best_match


def calculate_distance_score(distance_km: float) -> float:
    """Calculate DistanceScore based on distance ranges:
    - 0-5 km: 1.0
    - 5-10 km: 0.8
    - 10-20 km: 0.6
    - 20-50 km: 0.4
    - 50+ km: 0.2
    """
    if distance_km < 5.0:
        return 1.0
    elif distance_km < 10.0:
        return 0.8
    elif distance_km < 20.0:
        return 0.6
    elif distance_km < 50.0:
        return 0.4
    else:
        return 0.2


def calculate_rating_score(average_rating: float) -> float:
    """Calculate RatingScore = Average Rating / 5"""
    if average_rating <= 0.0:
        return 0.0
    return min(max(average_rating / 5.0, 0.0), 1.0)


def calculate_visibility_score(
    material_match: float, distance_score: float, rating_score: float
) -> float:
    """Visibility Score Formula:
    Visibility Score = 10 * (0.40 * MaterialMatch + 0.35 * DistanceScore + 0.25 * RatingScore)
    """
    raw_score = 10.0 * (
        0.40 * material_match + 0.35 * distance_score + 0.25 * rating_score
    )
    return round(raw_score, 2)
