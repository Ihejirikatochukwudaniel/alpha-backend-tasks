from sqlalchemy import Column, String, Text, Boolean, TIMESTAMP, ForeignKey, Integer, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Enum
from app.database import Base
import uuid
from datetime import datetime

class Briefing(Base):
    __tablename__ = "briefings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String, nullable=False)
    ticker = Column(String, nullable=False)
    sector = Column(String)
    analyst_name = Column(String)
    summary = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    is_generated = Column(Boolean, default=False)
    generated_at = Column(TIMESTAMP)
    html_content = Column(Text)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

class BriefingPoint(Base):
    __tablename__ = "briefing_points"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    briefing_id = Column(UUID(as_uuid=True), ForeignKey("briefings.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum('key_point', 'risk', name='briefing_point_type'), nullable=False)
    content = Column(Text, nullable=False)
    display_order = Column(Integer, nullable=False)

class BriefingMetric(Base):
    __tablename__ = "briefing_metrics"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    briefing_id = Column(UUID(as_uuid=True), ForeignKey("briefings.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    value = Column(String, nullable=False)

Index("ix_briefing_points_briefing_id", BriefingPoint.briefing_id)
Index("ix_briefing_metrics_briefing_id", BriefingMetric.briefing_id)
UniqueConstraint(BriefingMetric.briefing_id, BriefingMetric.name, name="uq_briefing_metric_name")