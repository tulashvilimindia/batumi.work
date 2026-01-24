from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(Integer, unique=True, nullable=False, index=True)  # hr.ge announcement_id
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)

    # Core fields
    title = Column(String(500), nullable=False)
    title_en = Column(String(500))
    description = Column(Text)  # HTML content
    slug = Column(String(500))

    # Dates
    publish_date = Column(DateTime, index=True)
    deadline_date = Column(DateTime, index=True)
    renewal_date = Column(DateTime)

    # Salary
    salary_from = Column(Integer, index=True)
    salary_to = Column(Integer, index=True)
    salary_currency = Column(String(10), default="GEL")
    show_salary = Column(Boolean, default=True)
    is_with_bonus = Column(Boolean, default=False)

    # Work conditions
    is_work_from_home = Column(Boolean, default=False)
    is_suitable_for_student = Column(Boolean, default=False)
    employment_type = Column(String(100))
    work_schedule = Column(String(100))

    # Contact
    contact_email = Column(String(255))
    contact_phone = Column(String(50))
    contact_name = Column(String(255))
    hide_contact_person = Column(Boolean, default=False)

    # Status
    is_expired = Column(Boolean, default=False, index=True)
    is_priority = Column(Boolean, default=False)
    application_method = Column(Integer)  # 1=Email, 2=HR.ge, 3=External

    # Arrays stored as JSONB
    languages = Column(JSONB)  # ["English", "Georgian"]
    addresses = Column(JSONB, index=True)  # ["Tbilisi", "Batumi"]
    benefits = Column(JSONB)
    driving_licenses = Column(JSONB)

    # Full API response
    raw_json = Column(JSONB)

    # Metadata
    source_tenant = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    last_scraped_at = Column(DateTime)

    # Relationships
    company = relationship("Company", back_populates="jobs")
    locations = relationship("Location", secondary="job_locations", backref="jobs")
    industries = relationship("Industry", secondary="job_industries", backref="jobs")
    specializations = relationship("Specialization", secondary="job_specializations", backref="jobs")


class JobLocation(Base):
    __tablename__ = "job_locations"

    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True)
    location_id = Column(Integer, ForeignKey("locations.id"), primary_key=True)


class JobIndustry(Base):
    __tablename__ = "job_industries"

    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True)
    industry_id = Column(Integer, ForeignKey("industries.id"), primary_key=True)


class JobSpecialization(Base):
    __tablename__ = "job_specializations"

    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True)
    specialization_id = Column(Integer, ForeignKey("specializations.id"), primary_key=True)
