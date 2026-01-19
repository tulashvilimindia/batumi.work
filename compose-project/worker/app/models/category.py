"""Category model for the parser worker."""
from sqlalchemy import Column, String

from .base import Base, UUIDMixin, TimestampMixin


class Category(Base, UUIDMixin, TimestampMixin):
    """Category model for looking up category_id by slug."""

    __tablename__ = "categories"
    __table_args__ = {"extend_existing": True}

    slug = Column(String(100), unique=True, nullable=False)
    name_ge = Column(String(200), nullable=False)
    name_en = Column(String(200), nullable=True)
