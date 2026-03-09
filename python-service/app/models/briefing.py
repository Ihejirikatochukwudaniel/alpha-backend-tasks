from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Integer, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.database import Base
from uuid import uuid4
from datetime import datetime, timezone


def _uuid():
    return uuid4().hex


class Briefing(Base):
    __tablename__ = "briefings"

    id = Column(String(32), primary_key=True, default=_uuid)
    company_name = Column(String, nullable=False)
    ticker = Column(String, nullable=False)
    sector = Column(String)
    analyst_name = Column(String)
    summary = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    is_generated = Column(Boolean, default=False)
    generated_at = Column(DateTime, nullable=True)
    html_content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    points = relationship("BriefingPoint", back_populates="briefing", cascade="all, delete-orphan")
    metrics = relationship("BriefingMetric", back_populates="briefing", cascade="all, delete-orphan")


class BriefingPoint(Base):
    __tablename__ = "briefing_points"

    id = Column(String(32), primary_key=True, default=_uuid)
    briefing_id = Column(String(32), ForeignKey("briefings.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    display_order = Column(Integer, nullable=False, default=0)

    briefing = relationship("Briefing", back_populates="points")


class BriefingMetric(Base):
    __tablename__ = "briefing_metrics"

    id = Column(String(32), primary_key=True, default=_uuid)
    briefing_id = Column(String(32), ForeignKey("briefings.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    value = Column(String, nullable=False)

    briefing = relationship("Briefing", back_populates="metrics")

    __table_args__ = (
        UniqueConstraint("briefing_id", "name", name="uq_briefing_metric_name"),
    )


Index("ix_briefing_points_briefing_id", BriefingPoint.briefing_id)
Index("ix_briefing_metrics_briefing_id", BriefingMetric.briefing_id)