"""Initial schema with categories, regions, companies, and jobs tables.

Revision ID: 20260119_000001
Revises:
Create Date: 2026-01-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260119_000001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name_ge', sa.String(100), nullable=False),
        sa.Column('name_en', sa.String(100), nullable=True),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('code', sa.String(50), nullable=False),
        sa.Column('description_ge', sa.String(500), nullable=True),
        sa.Column('description_en', sa.String(500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
        sa.UniqueConstraint('code')
    )
    op.create_index('idx_categories_slug', 'categories', ['slug'])

    # Create regions table
    op.create_table(
        'regions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('parent_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('level', sa.Integer(), nullable=False),
        sa.Column('name_ge', sa.String(100), nullable=False),
        sa.Column('name_en', sa.String(100), nullable=True),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('latitude', sa.Numeric(10, 8), nullable=True),
        sa.Column('longitude', sa.Numeric(11, 8), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['parent_id'], ['regions.id']),
        sa.UniqueConstraint('slug')
    )
    op.create_index('idx_regions_slug', 'regions', ['slug'])
    op.create_index('idx_regions_level', 'regions', ['level'])

    # Create companies table
    op.create_table(
        'companies',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name_ge', sa.String(255), nullable=False),
        sa.Column('name_en', sa.String(255), nullable=True),
        sa.Column('slug', sa.String(255), nullable=True),
        sa.Column('description_ge', sa.Text(), nullable=True),
        sa.Column('description_en', sa.Text(), nullable=True),
        sa.Column('logo_url', sa.String(500), nullable=True),
        sa.Column('website', sa.String(500), nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('facebook_url', sa.String(500), nullable=True),
        sa.Column('linkedin_url', sa.String(500), nullable=True),
        sa.Column('active_jobs_count', sa.Integer(), nullable=False, default=0),
        sa.Column('total_jobs_count', sa.Integer(), nullable=False, default=0),
        sa.Column('is_verified', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    op.create_index('idx_companies_slug', 'companies', ['slug'])
    op.create_index('idx_companies_name', 'companies', ['name_ge', 'name_en'])

    # Create jobs table
    op.create_table(
        'jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title_ge', sa.String(500), nullable=False),
        sa.Column('title_en', sa.String(500), nullable=True),
        sa.Column('body_ge', sa.Text(), nullable=False),
        sa.Column('body_en', sa.Text(), nullable=True),
        sa.Column('company_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('company_name', sa.String(255), nullable=True),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('region_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('remote_type', sa.String(20), nullable=False, default='onsite'),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('employment_type', sa.String(20), nullable=False, default='full_time'),
        sa.Column('experience_level', sa.String(20), nullable=True),
        sa.Column('has_salary', sa.Boolean(), nullable=False, default=False),
        sa.Column('salary_min', sa.Integer(), nullable=True),
        sa.Column('salary_max', sa.Integer(), nullable=True),
        sa.Column('salary_currency', sa.String(3), nullable=False, default='GEL'),
        sa.Column('salary_period', sa.String(20), nullable=False, default='monthly'),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deadline_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, default='active'),
        sa.Column('is_vip', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_featured', sa.Boolean(), nullable=False, default=False),
        sa.Column('parsed_from', sa.String(100), nullable=False, default='manual'),
        sa.Column('external_id', sa.String(255), nullable=True),
        sa.Column('source_url', sa.Text(), nullable=True),
        sa.Column('content_hash', sa.String(64), nullable=True),
        sa.Column('first_seen_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_seen_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id']),
        sa.ForeignKeyConstraint(['region_id'], ['regions.id']),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id']),
        sa.UniqueConstraint('parsed_from', 'external_id', name='uix_job_source')
    )
    op.create_index('idx_jobs_status', 'jobs', ['status'])
    op.create_index('idx_jobs_category', 'jobs', ['category_id'])
    op.create_index('idx_jobs_region', 'jobs', ['region_id'])
    op.create_index('idx_jobs_company', 'jobs', ['company_id'])
    op.create_index('idx_jobs_published', 'jobs', ['published_at'])
    op.create_index(
        'idx_jobs_has_salary',
        'jobs',
        ['has_salary'],
        postgresql_where=sa.text('has_salary = true')
    )


def downgrade() -> None:
    op.drop_table('jobs')
    op.drop_table('companies')
    op.drop_table('regions')
    op.drop_table('categories')
