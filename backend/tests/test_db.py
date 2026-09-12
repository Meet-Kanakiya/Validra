import inspect
import pytest
from sqlalchemy.orm import DeclarativeBase
from app.db import Base, AsyncSessionLocal, engine, get_db, init_db
from app.models import Inspection, Image


def test_base_declarative_and_models():
    """Verify Base is a DeclarativeBase and registered models exist."""
    assert issubclass(Base, DeclarativeBase)
    assert "inspections" in Base.metadata.tables
    assert "images" in Base.metadata.tables


def test_db_session_and_engine():
    """Verify engine and sessionmaker are configured."""
    assert engine is not None
    assert str(engine.url).startswith("postgresql+asyncpg://")
    assert AsyncSessionLocal is not None


def test_get_db_generator():
    """Verify get_db is an async generator function."""
    assert inspect.isasyncgenfunction(get_db)


def test_init_db_callable():
    """Verify init_db is a coroutine function."""
    assert inspect.iscoroutinefunction(init_db)
