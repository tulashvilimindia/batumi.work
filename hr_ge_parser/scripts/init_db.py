#!/usr/bin/env python
"""Initialize the database with Alembic migrations."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from alembic.config import Config
from alembic import command
from app.database import engine, Base
from app.models import *  # noqa - Import all models


def init_database():
    """Initialize the database."""
    print("Initializing database...")

    # Create tables directly using SQLAlchemy
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    print("Database initialized successfully!")


def run_migrations():
    """Run Alembic migrations."""
    print("Running migrations...")

    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")

    print("Migrations completed!")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Initialize the database")
    parser.add_argument(
        "--method",
        choices=["create", "migrate"],
        default="create",
        help="Method to initialize: 'create' (SQLAlchemy) or 'migrate' (Alembic)",
    )

    args = parser.parse_args()

    if args.method == "create":
        init_database()
    else:
        run_migrations()
