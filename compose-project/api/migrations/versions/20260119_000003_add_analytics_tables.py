"""Add job_views and search_analytics tables for analytics

Revision ID: 003
Revises: 002
Create Date: 2026-01-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '20260119_000003'
down_revision = '20260119_000002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create job_views table for tracking views
    op.create_table(
        'job_views',
        sa.Column('id', sa.BigInteger(), autoincrement=True, primary_key=True),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('viewed_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),

        # Session tracking
        sa.Column('session_id', sa.String(64), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('ip_hash', sa.String(64), nullable=True),  # SHA-256 hashed for privacy

        # Source tracking
        sa.Column('referrer', sa.String(500), nullable=True),
        sa.Column('utm_source', sa.String(100), nullable=True),
        sa.Column('utm_medium', sa.String(100), nullable=True),
        sa.Column('utm_campaign', sa.String(100), nullable=True),

        # Device info
        sa.Column('device_type', sa.String(20), nullable=True),  # mobile, tablet, desktop
        sa.Column('browser', sa.String(50), nullable=True),
        sa.Column('os', sa.String(50), nullable=True),

        # Location (from IP geolocation)
        sa.Column('country_code', sa.String(2), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),

        # Language
        sa.Column('language', sa.String(2), nullable=True),  # ge, en
    )

    # Create indexes for job_views
    op.create_index('idx_job_views_job', 'job_views', ['job_id'])
    op.create_index('idx_job_views_date', 'job_views', ['viewed_at'])
    op.create_index('idx_job_views_session', 'job_views', ['session_id'])

    # Create search_analytics table
    op.create_table(
        'search_analytics',
        sa.Column('id', sa.BigInteger(), autoincrement=True, primary_key=True),
        sa.Column('searched_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),

        # Query info
        sa.Column('query', sa.String(255), nullable=True),
        sa.Column('query_normalized', sa.String(255), nullable=True),  # lowercase, trimmed

        # Filters used
        sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('region_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('has_salary_filter', sa.Boolean(), nullable=True),
        sa.Column('is_vip_filter', sa.Boolean(), nullable=True),
        sa.Column('filters_json', postgresql.JSON(), nullable=True),

        # Results
        sa.Column('results_count', sa.Integer(), nullable=True),
        sa.Column('results_shown', sa.Integer(), nullable=True),

        # User action
        sa.Column('clicked_job_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('time_to_click_ms', sa.Integer(), nullable=True),

        # Session
        sa.Column('session_id', sa.String(64), nullable=True),
        sa.Column('language', sa.String(2), nullable=True),
    )

    # Create indexes for search_analytics
    op.create_index('idx_search_date', 'search_analytics', ['searched_at'])
    op.create_index('idx_search_query', 'search_analytics', ['query_normalized'])
    op.create_index('idx_search_session', 'search_analytics', ['session_id'])

    # Create materialized view for daily job stats
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_job_stats AS
        SELECT
            DATE(created_at) as date,
            COUNT(*) as jobs_created,
            COUNT(*) FILTER (WHERE status = 'active') as jobs_active,
            COUNT(*) FILTER (WHERE has_salary = true) as jobs_with_salary,
            COUNT(DISTINCT category_id) as categories_with_jobs,
            COUNT(DISTINCT company_name) as unique_companies,
            COALESCE(AVG(salary_min) FILTER (WHERE salary_min IS NOT NULL), 0) as avg_salary_min,
            COALESCE(AVG(salary_max) FILTER (WHERE salary_max IS NOT NULL), 0) as avg_salary_max
        FROM jobs
        GROUP BY DATE(created_at)
    """)

    op.execute("CREATE UNIQUE INDEX idx_mv_daily_job_stats_date ON mv_daily_job_stats(date)")

    # Create materialized view for daily views
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_views AS
        SELECT
            DATE(viewed_at) as date,
            COUNT(*) as total_views,
            COUNT(DISTINCT session_id) as unique_visitors,
            COUNT(DISTINCT job_id) as jobs_viewed,
            COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_views,
            COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_views
        FROM job_views
        GROUP BY DATE(viewed_at)
    """)

    op.execute("CREATE UNIQUE INDEX idx_mv_daily_views_date ON mv_daily_views(date)")

    # Create materialized view for category stats
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_category_stats AS
        SELECT
            c.id as category_id,
            c.name_ge,
            c.slug,
            COUNT(DISTINCT j.id) as job_count,
            COUNT(DISTINCT jv.id) as view_count,
            COALESCE(ROUND(AVG(j.salary_min)), 0) as avg_salary_min,
            COALESCE(ROUND(AVG(j.salary_max)), 0) as avg_salary_max
        FROM categories c
        LEFT JOIN jobs j ON j.category_id = c.id AND j.status = 'active'
        LEFT JOIN job_views jv ON jv.job_id = j.id
        GROUP BY c.id, c.name_ge, c.slug
    """)

    op.execute("CREATE UNIQUE INDEX idx_mv_category_stats_id ON mv_category_stats(category_id)")

    # Create materialized view for search trends
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_search_trends AS
        SELECT
            DATE(searched_at) as date,
            query_normalized,
            COUNT(*) as search_count,
            COALESCE(AVG(results_count), 0) as avg_results,
            COUNT(*) FILTER (WHERE clicked_job_id IS NOT NULL) as searches_with_click,
            COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE clicked_job_id IS NOT NULL) / NULLIF(COUNT(*), 0), 2), 0) as click_rate
        FROM search_analytics
        WHERE searched_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(searched_at), query_normalized
        HAVING COUNT(*) > 5
    """)

    op.execute("CREATE INDEX idx_mv_search_trends_date ON mv_search_trends(date)")
    op.execute("CREATE INDEX idx_mv_search_trends_query ON mv_search_trends(query_normalized)")


def downgrade() -> None:
    # Drop materialized views
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_search_trends")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_category_stats")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_daily_views")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_daily_job_stats")

    # Drop tables
    op.drop_table('search_analytics')
    op.drop_table('job_views')
