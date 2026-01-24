from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class ParserRun(Base):
    __tablename__ = "parser_runs"

    id = Column(Integer, primary_key=True, index=True)
    started_at = Column(DateTime, server_default=func.now())
    finished_at = Column(DateTime)
    status = Column(String(50), default="running")  # running, completed, failed
    jobs_found = Column(Integer, default=0)
    jobs_created = Column(Integer, default=0)
    jobs_updated = Column(Integer, default=0)
    jobs_failed = Column(Integer, default=0)
    error_message = Column(Text)
    run_type = Column(String(50), default="full")  # full, incremental
