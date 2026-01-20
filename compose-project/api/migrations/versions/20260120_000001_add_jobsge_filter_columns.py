"""Add jobsge_cid and jobsge_lid columns to jobs table

These columns store the original jobs.ge filter values used to find each job.
- jobsge_cid: Original jobs.ge category ID (cid parameter)
- jobsge_lid: Original jobs.ge location ID (lid parameter)

This enables tracking where each job came from in terms of jobs.ge's own
categorization, rather than relying on keyword-based classification.

Revision ID: 20260120_000001
Revises: 20260119_000004
Create Date: 2026-01-20

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '20260120_000001'
down_revision = '20260119_000004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add jobsge_cid column (original jobs.ge category ID)
    op.add_column(
        'jobs',
        sa.Column('jobsge_cid', sa.Integer(), nullable=True,
                  comment='Original jobs.ge category ID (cid parameter)')
    )

    # Add jobsge_lid column (original jobs.ge location ID)
    op.add_column(
        'jobs',
        sa.Column('jobsge_lid', sa.Integer(), nullable=True,
                  comment='Original jobs.ge location ID (lid parameter)')
    )

    # Create indexes for filtering by original source values
    op.create_index('idx_jobs_jobsge_cid', 'jobs', ['jobsge_cid'])
    op.create_index('idx_jobs_jobsge_lid', 'jobs', ['jobsge_lid'])


def downgrade() -> None:
    op.drop_index('idx_jobs_jobsge_lid', 'jobs')
    op.drop_index('idx_jobs_jobsge_cid', 'jobs')
    op.drop_column('jobs', 'jobsge_lid')
    op.drop_column('jobs', 'jobsge_cid')
