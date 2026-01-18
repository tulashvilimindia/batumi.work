"""Region model with hierarchical structure."""
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Region(Base, UUIDMixin, TimestampMixin):
    """Geographic region model with hierarchy support.

    Hierarchy levels:
        1 = Country (e.g., Georgia)
        2 = Region/State (e.g., Adjara, Tbilisi)
        3 = City (e.g., Batumi, Kutaisi)
    """

    __tablename__ = "regions"

    # Hierarchy
    parent_id = Column(UUID(as_uuid=True), ForeignKey("regions.id"), nullable=True)
    level = Column(Integer, nullable=False)  # 1=country, 2=region, 3=city

    # Names (bilingual)
    name_ge = Column(String(100), nullable=False)
    name_en = Column(String(100), nullable=True)

    # URL-friendly identifier
    slug = Column(String(100), unique=True, nullable=False, index=True)

    # Geo coordinates (optional)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)

    # Status and ordering
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    # Relationships
    parent = relationship("Region", remote_side="Region.id", backref="children")
    jobs = relationship("Job", back_populates="region")

    def __repr__(self):
        return f"<Region(id={self.id}, slug={self.slug}, name_ge={self.name_ge}, level={self.level})>"
