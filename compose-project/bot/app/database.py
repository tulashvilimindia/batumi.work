"""Database operations for Telegram bot subscriptions."""
import os
from typing import Dict, List, Optional
from sqlalchemy import Column, Integer, String, DateTime, UniqueConstraint, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from datetime import datetime

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@db:5432/jobboard"
)

Base = declarative_base()


class TelegramUser(Base):
    """Telegram user preferences."""
    __tablename__ = "telegram_users"

    id = Column(Integer, primary_key=True)
    telegram_id = Column(Integer, unique=True, nullable=False, index=True)
    language = Column(String(2), default="ge")
    created_at = Column(DateTime, default=datetime.utcnow)


class TelegramSubscription(Base):
    """User category subscriptions."""
    __tablename__ = "telegram_subscriptions"

    id = Column(Integer, primary_key=True)
    telegram_id = Column(Integer, nullable=False, index=True)
    category_slug = Column(String(100), nullable=False)
    category_name = Column(String(200))
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("telegram_id", "category_slug", name="uix_user_category"),
    )


# Database connection
engine = None
async_session = None


async def init_db():
    """Initialize database connection and create tables."""
    global engine, async_session

    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db_session() -> AsyncSession:
    """Get a database session."""
    if not async_session:
        await init_db()
    return async_session()


async def get_user_language(telegram_id: int) -> Optional[str]:
    """Get user's language preference."""
    async with await get_db_session() as session:
        result = await session.execute(
            text("SELECT language FROM telegram_users WHERE telegram_id = :tid"),
            {"tid": telegram_id}
        )
        row = result.fetchone()
        return row[0] if row else None


async def set_user_language(telegram_id: int, language: str):
    """Set user's language preference."""
    async with await get_db_session() as session:
        # Upsert user
        await session.execute(
            text("""
                INSERT INTO telegram_users (telegram_id, language)
                VALUES (:tid, :lang)
                ON CONFLICT (telegram_id)
                DO UPDATE SET language = :lang
            """),
            {"tid": telegram_id, "lang": language}
        )
        await session.commit()


async def get_user_subscriptions(telegram_id: int) -> List[dict]:
    """Get user's category subscriptions."""
    async with await get_db_session() as session:
        result = await session.execute(
            text("""
                SELECT category_slug, category_name
                FROM telegram_subscriptions
                WHERE telegram_id = :tid
            """),
            {"tid": telegram_id}
        )
        return [
            {"category_slug": row[0], "category_name": row[1]}
            for row in result.fetchall()
        ]


async def add_subscription(telegram_id: int, category_slug: str, category_name: str):
    """Add a subscription for a user."""
    async with await get_db_session() as session:
        await session.execute(
            text("""
                INSERT INTO telegram_subscriptions (telegram_id, category_slug, category_name)
                VALUES (:tid, :slug, :name)
                ON CONFLICT (telegram_id, category_slug) DO NOTHING
            """),
            {"tid": telegram_id, "slug": category_slug, "name": category_name}
        )
        await session.commit()


async def remove_subscription(telegram_id: int, category_slug: str):
    """Remove a subscription for a user."""
    async with await get_db_session() as session:
        await session.execute(
            text("""
                DELETE FROM telegram_subscriptions
                WHERE telegram_id = :tid AND category_slug = :slug
            """),
            {"tid": telegram_id, "slug": category_slug}
        )
        await session.commit()


async def get_all_subscriptions() -> Dict[int, List[dict]]:
    """Get all subscriptions grouped by user ID.

    Returns:
        Dict mapping telegram_id to list of subscriptions
    """
    async with await get_db_session() as session:
        result = await session.execute(
            text("""
                SELECT telegram_id, category_slug, category_name
                FROM telegram_subscriptions
            """)
        )

        subscriptions: Dict[int, List[dict]] = {}
        for row in result.fetchall():
            tid, slug, name = row
            if tid not in subscriptions:
                subscriptions[tid] = []
            subscriptions[tid].append({
                "category_slug": slug,
                "category_name": name,
            })

        return subscriptions
