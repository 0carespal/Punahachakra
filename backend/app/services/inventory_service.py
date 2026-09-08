import uuid
from typing import List, Optional, Tuple
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    BadRequestException,
)
from app.models.inventory import Inventory
from app.models.user import User, UserRole, KabadiwalaProfile
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.material_repository import MaterialRepository
from app.repositories.user_repository import UserRepository
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryFilter


class InventoryService:
    def __init__(
        self,
        inventory_repo: InventoryRepository,
        material_repo: MaterialRepository,
        user_repo: UserRepository,
    ):
        self.inventory_repo = inventory_repo
        self.material_repo = material_repo
        self.user_repo = user_repo

    async def _get_or_create_kabadiwala_profile(self, user: User) -> KabadiwalaProfile:
        if user.kabadiwala_profile:
            return user.kabadiwala_profile

        # Fallback creation if user profile isn't initialized yet
        profile = KabadiwalaProfile(
            user_id=user.id,
            full_name=user.email.split("@")[0].capitalize(),
            location="India",
            average_rating=0.0,
            visibility_score=0.0,
        )
        profile = await self.user_repo.create_kabadiwala_profile(profile)
        user.kabadiwala_profile = profile
        return profile

    async def create_inventory(
        self, current_user: User, inventory_in: InventoryCreate
    ) -> Inventory:
        if current_user.role not in [UserRole.KABADIWALA, UserRole.ADMIN]:
            raise ForbiddenException("Only Kabadiwalas or Admins can manage inventory")

        profile = await self._get_or_create_kabadiwala_profile(current_user)

        # Resolve material
        if inventory_in.material_id:
            material = await self.material_repo.get_by_id(inventory_in.material_id)
            if not material:
                raise NotFoundException("Specified material was not found")
        elif inventory_in.material_name:
            cat_name = inventory_in.category or "General Scrap"
            material = await self.material_repo.get_or_create(
                name=inventory_in.material_name, category=cat_name
            )
        else:
            raise BadRequestException("Either material_name or material_id must be provided")

        # Check if Kabadiwala already has an inventory entry for this material
        existing_inventory = await self.inventory_repo.get_by_kabadiwala_and_material(
            kabadiwala_id=profile.id, material_id=material.id
        )

        if existing_inventory:
            # Update quantity and price range on existing entry
            existing_inventory.quantity += inventory_in.quantity
            existing_inventory.price_range_min = inventory_in.price_range_min
            existing_inventory.price_range_max = inventory_in.price_range_max
            await self.inventory_repo.session.flush()
            await self.inventory_repo.session.refresh(existing_inventory)
            return await self.inventory_repo.get_by_id_detailed(existing_inventory.id)  # type: ignore

        inventory_dict = {
            "kabadiwala_id": profile.id,
            "material_id": material.id,
            "quantity": inventory_in.quantity,
            "price_range_min": inventory_in.price_range_min,
            "price_range_max": inventory_in.price_range_max,
        }

        created = await self.inventory_repo.create(inventory_dict)
        return await self.inventory_repo.get_by_id_detailed(created.id)  # type: ignore

    async def get_inventory(self, inventory_id: uuid.UUID) -> Inventory:
        inventory = await self.inventory_repo.get_by_id_detailed(inventory_id)
        if not inventory:
            raise NotFoundException(f"Inventory item with ID '{inventory_id}' not found")
        return inventory

    async def get_my_inventory(
        self,
        current_user: User,
        filters: Optional[InventoryFilter] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Inventory], int]:
        if current_user.role not in [UserRole.KABADIWALA, UserRole.ADMIN]:
            raise ForbiddenException("Only Kabadiwalas or Admins can access personal inventory")

        profile = await self._get_or_create_kabadiwala_profile(current_user)
        return await self.inventory_repo.filter_inventories(
            kabadiwala_id=profile.id, filters=filters, skip=skip, limit=limit
        )

    async def list_inventories(
        self,
        filters: Optional[InventoryFilter] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Inventory], int]:
        return await self.inventory_repo.filter_inventories(
            kabadiwala_id=None, filters=filters, skip=skip, limit=limit
        )

    async def update_inventory(
        self,
        inventory_id: uuid.UUID,
        current_user: User,
        inventory_in: InventoryUpdate,
    ) -> Inventory:
        inventory = await self.get_inventory(inventory_id)

        profile = await self._get_or_create_kabadiwala_profile(current_user)
        if inventory.kabadiwala_id != profile.id and current_user.role != UserRole.ADMIN:
            raise ForbiddenException("You can only edit your own inventory items")

        # Validate price range if updating bounds
        new_min = (
            inventory_in.price_range_min
            if inventory_in.price_range_min is not None
            else inventory.price_range_min
        )
        new_max = (
            inventory_in.price_range_max
            if inventory_in.price_range_max is not None
            else inventory.price_range_max
        )
        if new_max < new_min:
            raise BadRequestException(
                f"price_range_max ({new_max}) cannot be less than price_range_min ({new_min})"
            )

        # Handle material change if requested
        if inventory_in.material_id:
            material = await self.material_repo.get_by_id(inventory_in.material_id)
            if not material:
                raise NotFoundException("Specified material was not found")
            inventory.material_id = material.id
        elif inventory_in.material_name:
            cat_name = (
                inventory_in.category
                or (inventory.material.category if inventory.material else "General Scrap")
            )
            material = await self.material_repo.get_or_create(
                name=inventory_in.material_name, category=cat_name
            )
            inventory.material_id = material.id
        elif inventory_in.category and inventory.material:
            # Update existing material's category if category is specified without changing material_name
            material = await self.material_repo.get_or_create(
                name=inventory.material.name, category=inventory_in.category
            )
            inventory.material_id = material.id

        if inventory_in.quantity is not None:
            inventory.quantity = inventory_in.quantity
        if inventory_in.price_range_min is not None:
            inventory.price_range_min = inventory_in.price_range_min
        if inventory_in.price_range_max is not None:
            inventory.price_range_max = inventory_in.price_range_max

        await self.inventory_repo.session.flush()
        await self.inventory_repo.session.refresh(inventory)
        return await self.get_inventory(inventory_id)

    async def delete_inventory(
        self, inventory_id: uuid.UUID, current_user: User
    ) -> bool:
        inventory = await self.get_inventory(inventory_id)

        profile = await self._get_or_create_kabadiwala_profile(current_user)
        if inventory.kabadiwala_id != profile.id and current_user.role != UserRole.ADMIN:
            raise ForbiddenException("You can only delete your own inventory items")

        return await self.inventory_repo.delete(inventory_id)
