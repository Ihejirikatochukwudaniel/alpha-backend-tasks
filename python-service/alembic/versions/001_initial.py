from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('briefings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=sa.text('gen_random_uuid()')),
        sa.Column('company_name', sa.String(), nullable=False),
        sa.Column('ticker', sa.String(), nullable=False),
        sa.Column('sector', sa.String(), nullable=True),
        sa.Column('analyst_name', sa.String(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('recommendation', sa.Text(), nullable=False),
        sa.Column('is_generated', sa.Boolean(), nullable=True, default=False),
        sa.Column('generated_at', sa.TIMESTAMP(), nullable=True),
        sa.Column('html_content', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=True, default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('briefing_points',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=sa.text('gen_random_uuid()')),
        sa.Column('briefing_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.Enum('key_point', 'risk', name='briefing_point_type'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['briefing_id'], ['briefings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('briefing_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=sa.text('gen_random_uuid()')),
        sa.Column('briefing_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('value', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['briefing_id'], ['briefings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('briefing_id', 'name', name='uq_briefing_metric_name')
    )
    op.create_index('ix_briefing_points_briefing_id', 'briefing_points', ['briefing_id'], unique=False)
    op.create_index('ix_briefing_metrics_briefing_id', 'briefing_metrics', ['briefing_id'], unique=False)

def downgrade():
    op.drop_index('ix_briefing_metrics_briefing_id', table_name='briefing_metrics')
    op.drop_index('ix_briefing_points_briefing_id', table_name='briefing_points')
    op.drop_table('briefing_metrics')
    op.drop_table('briefing_points')
    op.drop_table('briefings')
    op.execute('DROP TYPE briefing_point_type')