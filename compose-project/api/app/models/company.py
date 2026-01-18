"""Company model."""
from sqlalchemy import Column, String, Boolean, Integer, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Company(Base, UUIDMixin, TimestampMixin):
    """Company/employer model."""

    __tablename__ = "companies"

    # Basic info (bilingual)
    name_ge = Column(String(255), nullable=False)
    name_en = Column(String(255), nullable=True)

    # URL-friendly identifier
    slug = Column(String(255), unique=True, nullable=True, index=True)

    # Details (bilingual)
    description_ge = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)

    # Branding
    logo_url = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)

    # Contact information
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)

    # Social links
    facebook_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)

    # Denormalized stats for performance
    active_jobs_count = Column(Integer, default=0, nullable=False)
    total_jobs_count = Column(Integer, default=0, nullable=False)

    # Status
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    jobs = relationship("Job", back_populates="company")

    def __repr__(self):
        return f"<Company(id={self.id}, slug={self.slug}, name_ge={self.name_ge})>"
