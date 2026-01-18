"""Add parser_runs table

Revision ID: 002
Revises: 001
Create Date: 2026-01-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '20260119_000002'
down_revision = '20260119_000001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'parser_runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('source', sa.String(100), nullable=False, index=True),
        sa.Column('regions', postgresql.JSON(), server_default='[]'),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('finished_at', sa.DateTime(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='running', index=True),
        sa.Column('total_found', sa.Integer(), server_default='0'),
        sa.Column('new_jobs', sa.Integer(), server_default='0'),
        sa.Column('updated_jobs', sa.Integer(), server_default='0'),
        sa.Column('skipped_jobs', sa.Integer(), server_default='0'),
        sa.Column('failed_jobs', sa.Integer(), server_default='0'),
        sa.Column('pages_parsed', sa.Integer(), server_default='0'),
        sa.Column('error_count', sa.Integer(), server_default='0'),
        sa.Column('error_samples', postgresql.JSON(), server_default='[]'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('triggered_by', sa.String(50), server_default="'scheduler'"),
    )

    # Create index on started_at for ordering
    op.create_index('ix_parser_runs_started_at', 'parser_runs', ['started_at'])


def downgrade() -> None:
    op.drop_index('ix_parser_runs_started_at')
    op.drop_table('parser_runs')
