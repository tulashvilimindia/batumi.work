#!/usr/bin/env python
"""Manual parser trigger script."""
import sys
import os
import asyncio
import argparse
import logging

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.parser.scraper import run_parser

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


async def main(run_type: str = "full"):
    """Run the parser."""
    logger.info(f"Starting {run_type} parser run...")

    db = SessionLocal()
    try:
        result = await run_parser(db, run_type=run_type)
        logger.info(f"Parser completed: {result}")
        return result
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the HR.GE parser manually")
    parser.add_argument(
        "--type",
        choices=["full", "incremental"],
        default="full",
        help="Type of parser run: 'full' (sitemap) or 'incremental' (API listing)",
    )

    args = parser.parse_args()

    asyncio.run(main(args.type))
