import uuid
from typing import List
from app.core.exceptions import NotFoundException, DuplicateResourceException
from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:
    def __init__(self, category_repo: CategoryRepository):
        self.category_repo = category_repo

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Category]:
        return await self.category_repo.get_all(skip=skip, limit=limit)

    async def get_by_id(self, category_id: uuid.UUID) -> Category:
        category = await self.category_repo.get_by_id(category_id)
        if not category:
            raise NotFoundException(f"Category with ID {category_id} not found")
        return category

    async def create(self, category_in: CategoryCreate) -> Category:
        existing = await self.category_repo.get_by_name(category_in.name)
        if existing:
            raise DuplicateResourceException(f"Category '{category_in.name}' already exists")
        return await self.category_repo.create(category_in)

    async def update(self, category_id: uuid.UUID, category_in: CategoryUpdate) -> Category:
        category = await self.get_by_id(category_id)
        if category_in.name and category_in.name != category.name:
            existing = await self.category_repo.get_by_name(category_in.name)
            if existing:
                raise DuplicateResourceException(f"Category '{category_in.name}' already exists")
        return await self.category_repo.update(category, category_in)
