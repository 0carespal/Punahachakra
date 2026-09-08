import math
from typing import List, TypeVar, Generic
from pydantic import BaseModel
from app.schemas.common import PaginatedResponse

T = TypeVar("T")


def paginate(items: List[T], total: int, page: int, page_size: int) -> PaginatedResponse[T]:
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    return PaginatedResponse[T](
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
