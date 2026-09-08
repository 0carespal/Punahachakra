import asyncio
from sqlalchemy import select
from app.core.config import settings
from app.core.logging import logger
from app.core.security import get_password_hash
from app.db.session import AsyncSessionLocal
from app.models.category import Category
from app.models.user import User, UserRole, UserProfile

INITIAL_CATEGORIES = [
    {"name": "PET Plastics", "description": "Polyethylene terephthalate bottles, containers, and packaging", "unit": "kg"},
    {"name": "HDPE Plastics", "description": "High-density polyethylene milk jugs, detergent bottles, and pipes", "unit": "kg"},
    {"name": "Ferrous Metals (Iron/Steel)", "description": "Heavy scrap iron, steel structural beams, sheets, and turnings", "unit": "ton"},
    {"name": "Non-Ferrous Metals (Copper/Brass)", "description": "Copper wires, cables, brass fittings, and scrap tubes", "unit": "kg"},
    {"name": "Aluminum Scrap", "description": "Aluminum cans, extrusion profiles, sheets, and alloys", "unit": "kg"},
    {"name": "Corrugated Cardboard & Paper", "description": "Industrial cardboard boxes, kraft paper, and office paper waste", "unit": "ton"},
    {"name": "Electronic Waste (E-Waste)", "description": "Printed circuit boards, computer hardware, and electrical components", "unit": "kg"},
    {"name": "Rubber Waste", "description": "Used tires, rubber sheets, industrial belts, and molded rubber", "unit": "ton"},
]


async def init_db():
    async with AsyncSessionLocal() as session:
        logger.info("Initializing database default data...")
        
        # Check categories
        for cat_data in INITIAL_CATEGORIES:
            result = await session.execute(select(Category).where(Category.name == cat_data["name"]))
            existing = result.scalars().first()
            if not existing:
                cat = Category(**cat_data)
                session.add(cat)
                logger.info(f"Added initial category: {cat_data['name']}")
        
        # Check default admin user
        admin_email = "admin@punahachakrana.com"
        result = await session.execute(select(User).where(User.email == admin_email))
        existing_admin = result.scalars().first()
        if not existing_admin:
            admin_user = User(
                email=admin_email,
                phone_number="+919876543210",
                hashed_password=get_password_hash("Admin@12345"),
                full_name="Marketplace Admin",
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True
            )
            session.add(admin_user)
            await session.flush()

            admin_profile = UserProfile(
                user_id=admin_user.id,
                company_name="Punahachakrana B2B Platform",
                address="Headquarters, Tech Park",
                city="Bengaluru",
                state="Karnataka",
                pincode="560001",
                bio="Official Marketplace Platform Administrator Account"
            )
            session.add(admin_profile)
            logger.info(f"Added default admin account: {admin_email}")

        await session.commit()
        logger.info("Database initialization complete.")


if __name__ == "__main__":
    asyncio.run(init_db())
