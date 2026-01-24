from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Industry(Base):
    __tablename__ = "industries"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(Integer, unique=True, index=True)
    name = Column(String(255), nullable=False)
    name_en = Column(String(255))
    parent_id = Column(Integer, ForeignKey("industries.id"))
    created_at = Column(DateTime, server_default=func.now())

    # Self-referential relationship for hierarchical industries
    parent = relationship("Industry", remote_side=[id], backref="children")

    # Relationship to companies
    companies = relationship("Company", back_populates="industry")
