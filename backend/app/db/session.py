from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings
from app.core.logging import logger

import socket

def is_postgres_available(host: str = settings.POSTGRES_SERVER, port: int = settings.POSTGRES_PORT) -> bool:
    try:
        with socket.create_connection((host, port), timeout=1.0):
            return True
    except Exception:
        return False

def get_engine():
    if is_postgres_available():
        logger.info("Connecting to PostgreSQL database...")
        return create_async_engine(
            settings.ASYNC_DATABASE_URI,
            echo=settings.DEBUG,
            future=True,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20
        )
    else:
        logger.warning("Local PostgreSQL server unreachable. Falling back to SQLite async engine.")
        return create_async_engine(
            "sqlite+aiosqlite:///./punahachakrana.db",
            echo=settings.DEBUG,
            future=True
        )

engine = get_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as exc:
            await session.rollback()
            logger.error(f"Database session rollback due to exception: {exc}")
            raise
        finally:
            await session.close()
