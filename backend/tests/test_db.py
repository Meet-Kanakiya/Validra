import pytest
from sqlalchemy.orm import DeclarativeBase
from app.db import Base, AsyncSessionLocal, engine, get_db


def test_base_declarative():
    """Verify Base is a DeclarativeBase and has no tables created yet."""
    assert issubclass(Base, DeclarativeBase)
    # Ensure no tables are defined/created automatically
    assert len(Base.metadata.tables) == 0


def test_db_session_and_engine():
    """Verify engine and sessionmaker are configured."""
    assert engine is not None
    assert str(engine.url).startswith("postgresql+asyncpg://")
    assert AsyncSessionLocal is not None


def test_get_db_generator():
    """Verify get_db is an async generator function."""
    import inspect
    assert inspect.isasyncgenfunction(get_db)
