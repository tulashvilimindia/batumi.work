from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(Integer, unique=True, nullable=False, index=True)  # hr.ge customer_id
    name = Column(String(500), nullable=False)
    name_en = Column(String(500))
    logo_url = Column(Text)
    thumbnail_url = Column(Text)
    cover_image_url = Column(Text)
    industry_id = Column(Integer, ForeignKey("industries.id"))
    is_anonymous = Column(Boolean, default=False)
    is_blacklisted = Column(Boolean, default=False)
    status_id = Column(Integer, default=1)
    raw_json = Column(JSONB)  # Store full API response
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    industry = relationship("Industry", back_populates="companies")
    jobs = relationship("Job", back_populates="company")
