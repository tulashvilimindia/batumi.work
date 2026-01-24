"""Initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Industries table (hierarchical)
    op.create_table(
        'industries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('external_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('name_en', sa.String(255), nullable=True),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['industries.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_industries_external_id', 'industries', ['external_id'], unique=True)
    op.create_index('ix_industries_id', 'industries', ['id'], unique=False)

    # Locations table (hierarchical)
    op.create_table(
        'locations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('external_id', sa.String(50), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('name_en', sa.String(255), nullable=True),
        sa.Column('type', sa.Integer(), nullable=True),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['locations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_locations_external_id', 'locations', ['external_id'], unique=True)
    op.create_index('ix_locations_id', 'locations', ['id'], unique=False)

    # Specializations table
    op.create_table(
        'specializations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('external_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('name_en', sa.String(255), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_specializations_external_id', 'specializations', ['external_id'], unique=True)
    op.create_index('ix_specializations_id', 'specializations', ['id'], unique=False)

    # Companies table
    op.create_table(
        'companies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('external_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(500), nullable=False),
        sa.Column('name_en', sa.String(500), nullable=True),
        sa.Column('logo_url', sa.Text(), nullable=True),
        sa.Column('thumbnail_url', sa.Text(), nullable=True),
        sa.Column('cover_image_url', sa.Text(), nullable=True),
        sa.Column('industry_id', sa.Integer(), nullable=True),
        sa.Column('is_anonymous', sa.Boolean(), default=False, nullable=True),
        sa.Column('is_blacklisted', sa.Boolean(), default=False, nullable=True),
        sa.Column('status_id', sa.Integer(), default=1, nullable=True),
        sa.Column('raw_json', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['industry_id'], ['industries.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_companies_external_id', 'companies', ['external_id'], unique=True)
    op.create_index('ix_companies_id', 'companies', ['id'], unique=False)

    # Jobs table
    op.create_table(
        'jobs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('external_id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('title_en', sa.String(500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('slug', sa.String(500), nullable=True),
        sa.Column('publish_date', sa.DateTime(), nullable=True),
        sa.Column('deadline_date', sa.DateTime(), nullable=True),
        sa.Column('renewal_date', sa.DateTime(), nullable=True),
        sa.Column('salary_from', sa.Integer(), nullable=True),
        sa.Column('salary_to', sa.Integer(), nullable=True),
        sa.Column('salary_currency', sa.String(10), default='GEL', nullable=True),
        sa.Column('show_salary', sa.Boolean(), default=True, nullable=True),
        sa.Column('is_with_bonus', sa.Boolean(), default=False, nullable=True),
        sa.Column('is_work_from_home', sa.Boolean(), default=False, nullable=True),
        sa.Column('is_suitable_for_student', sa.Boolean(), default=False, nullable=True),
        sa.Column('employment_type', sa.String(100), nullable=True),
        sa.Column('work_schedule', sa.String(100), nullable=True),
        sa.Column('contact_email', sa.String(255), nullable=True),
        sa.Column('contact_phone', sa.String(50), nullable=True),
        sa.Column('contact_name', sa.String(255), nullable=True),
        sa.Column('hide_contact_person', sa.Boolean(), default=False, nullable=True),
        sa.Column('is_expired', sa.Boolean(), default=False, nullable=True),
        sa.Column('is_priority', sa.Boolean(), default=False, nullable=True),
        sa.Column('application_method', sa.Integer(), nullable=True),
        sa.Column('languages', postgresql.JSONB(), nullable=True),
        sa.Column('addresses', postgresql.JSONB(), nullable=True),
        sa.Column('benefits', postgresql.JSONB(), nullable=True),
        sa.Column('driving_licenses', postgresql.JSONB(), nullable=True),
        sa.Column('raw_json', postgresql.JSONB(), nullable=True),
        sa.Column('source_tenant', sa.Integer(), default=1, nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('last_scraped_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_jobs_external_id', 'jobs', ['external_id'], unique=True)
    op.create_index('ix_jobs_id', 'jobs', ['id'], unique=False)
    op.create_index('ix_jobs_company_id', 'jobs', ['company_id'], unique=False)
    op.create_index('ix_jobs_publish_date', 'jobs', ['publish_date'], unique=False)
    op.create_index('ix_jobs_deadline_date', 'jobs', ['deadline_date'], unique=False)
    op.create_index('ix_jobs_is_expired', 'jobs', ['is_expired'], unique=False)
    op.create_index('ix_jobs_salary', 'jobs', ['salary_from', 'salary_to'], unique=False)
    op.create_index('ix_jobs_addresses', 'jobs', ['addresses'], unique=False, postgresql_using='gin')
    op.create_index('ix_jobs_raw_json', 'jobs', ['raw_json'], unique=False, postgresql_using='gin')

    # Job-Location many-to-many
    op.create_table(
        'job_locations',
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('location_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['location_id'], ['locations.id'], ),
        sa.PrimaryKeyConstraint('job_id', 'location_id')
    )

    # Job-Industry many-to-many
    op.create_table(
        'job_industries',
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('industry_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['industry_id'], ['industries.id'], ),
        sa.PrimaryKeyConstraint('job_id', 'industry_id')
    )

    # Job-Specialization many-to-many
    op.create_table(
        'job_specializations',
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('specialization_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['specialization_id'], ['specializations.id'], ),
        sa.PrimaryKeyConstraint('job_id', 'specialization_id')
    )

    # Parser runs table
    op.create_table(
        'parser_runs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('started_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('finished_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(50), default='running', nullable=True),
        sa.Column('jobs_found', sa.Integer(), default=0, nullable=True),
        sa.Column('jobs_created', sa.Integer(), default=0, nullable=True),
        sa.Column('jobs_updated', sa.Integer(), default=0, nullable=True),
        sa.Column('jobs_failed', sa.Integer(), default=0, nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('run_type', sa.String(50), default='full', nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_parser_runs_id', 'parser_runs', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('parser_runs')
    op.drop_table('job_specializations')
    op.drop_table('job_industries')
    op.drop_table('job_locations')
    op.drop_index('ix_jobs_raw_json', 'jobs')
    op.drop_index('ix_jobs_addresses', 'jobs')
    op.drop_index('ix_jobs_salary', 'jobs')
    op.drop_index('ix_jobs_is_expired', 'jobs')
    op.drop_index('ix_jobs_deadline_date', 'jobs')
    op.drop_index('ix_jobs_publish_date', 'jobs')
    op.drop_index('ix_jobs_company_id', 'jobs')
    op.drop_index('ix_jobs_external_id', 'jobs')
    op.drop_index('ix_jobs_id', 'jobs')
    op.drop_table('jobs')
    op.drop_index('ix_companies_external_id', 'companies')
    op.drop_index('ix_companies_id', 'companies')
    op.drop_table('companies')
    op.drop_index('ix_specializations_external_id', 'specializations')
    op.drop_index('ix_specializations_id', 'specializations')
    op.drop_table('specializations')
    op.drop_index('ix_locations_external_id', 'locations')
    op.drop_index('ix_locations_id', 'locations')
    op.drop_table('locations')
    op.drop_index('ix_industries_external_id', 'industries')
    op.drop_index('ix_industries_id', 'industries')
    op.drop_table('industries')
