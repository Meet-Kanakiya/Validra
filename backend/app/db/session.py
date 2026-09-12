"""Database engine and session management using SQLAlchemy 2.0 (async).

NOTE: Tables are NOT created automatically.
Table creation and migrations are managed separately.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.core.config import settings

# Create async engine for PostgreSQL
engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.ENV == "development"),
    future=True,
    pool_pre_ping=True,
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency to provide an async database session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
