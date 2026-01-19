"""Add channel_message_queue and channel_message_history tables

Revision ID: 004
Revises: 003
Create Date: 2026-01-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '20260119_000004'
down_revision = '20260119_000003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create channel_message_queue table
    op.create_table(
        'channel_message_queue',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),  # pending, processing, sent, failed, cancelled
        sa.Column('priority', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create indexes for channel_message_queue
    op.create_index('idx_queue_status', 'channel_message_queue', ['status'])
    op.create_index('idx_queue_scheduled', 'channel_message_queue', ['scheduled_at'])
    op.create_index('idx_queue_priority', 'channel_message_queue', ['priority', 'created_at'])

    # Create channel_message_history table
    op.create_table(
        'channel_message_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('queue_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('channel_message_queue.id', ondelete='SET NULL'), nullable=True),
        sa.Column('telegram_message_id', sa.BigInteger(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False),  # sent, failed, deleted
        sa.Column('message_text', sa.Text(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create indexes for channel_message_history
    op.create_index('idx_history_job', 'channel_message_history', ['job_id'])
    op.create_index('idx_history_status', 'channel_message_history', ['status'])
    op.create_index('idx_history_sent_at', 'channel_message_history', ['sent_at'])
    op.create_index('idx_history_telegram_msg', 'channel_message_history', ['telegram_message_id'])


def downgrade() -> None:
    # Drop tables
    op.drop_table('channel_message_history')
    op.drop_table('channel_message_queue')
