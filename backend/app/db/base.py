"""Base declarative class for SQLAlchemy models.

NOTE: Model definitions will be created by the team.
Do NOT create tables yet (no Base.metadata.create_all).
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Declarative base class for all SQLAlchemy ORM models."""
    pass
