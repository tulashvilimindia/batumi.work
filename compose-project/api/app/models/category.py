"""Category model."""
from sqlalchemy import Column, String, Boolean, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Category(Base, UUIDMixin, TimestampMixin):
    """Job category model."""

    __tablename__ = "categories"

    # Names (bilingual)
    name_ge = Column(String(100), nullable=False)
    name_en = Column(String(100), nullable=True)

    # URL-friendly identifier
    slug = Column(String(100), unique=True, nullable=False, index=True)

    # Category code for internal use
    code = Column(String(50), unique=True, nullable=False)

    # Description (optional)
    description_ge = Column(String(500), nullable=True)
    description_en = Column(String(500), nullable=True)

    # Status and ordering
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    # Relationships
    jobs = relationship("Job", back_populates="category")

    def __repr__(self):
        return f"<Category(id={self.id}, slug={self.slug}, name_ge={self.name_ge})>"
