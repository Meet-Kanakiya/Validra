"""SQLAlchemy models for Inspections (Scans) and Images."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Numeric,
    DateTime,
    Integer,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Inspection(Base):
    __tablename__ = "inspections"

    inspection_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    product_id = Column(UUID(as_uuid=True), nullable=True)
    inspector_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    status = Column(
        String(50),
        nullable=False,
        default="pending",
        index=True
    )  # pending, processing, quality_failed, completed, needs_review, finalized
    compliance_score = Column(Numeric(5, 2), nullable=True)
    inspector_remarks = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)
    finalized_at = Column(DateTime(timezone=True), nullable=True)

    # Relationship to images
    images = relationship("Image", back_populates="inspection", cascade="all, delete-orphan")


class Image(Base):
    __tablename__ = "images"

    image_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    inspection_id = Column(
        UUID(as_uuid=True),
        ForeignKey("inspections.inspection_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    type = Column(
        String(50),
        default="original",
        nullable=False
    )  # original, processed, evidence_crop
    storage_path = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    image_hash = Column(String(64), nullable=True)  # SHA-256
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    inspection = relationship("Inspection", back_populates="images")
