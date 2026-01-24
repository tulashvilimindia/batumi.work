from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(50), unique=True, index=True)  # MongoDB ObjectId from API
    name = Column(String(255), nullable=False)
    name_en = Column(String(255))
    type = Column(Integer)  # 6=City, 7=District, 8=Street
    parent_id = Column(Integer, ForeignKey("locations.id"))
    created_at = Column(DateTime, server_default=func.now())

    # Self-referential relationship for hierarchical locations
    parent = relationship("Location", remote_side=[id], backref="children")
