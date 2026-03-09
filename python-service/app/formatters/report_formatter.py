from dataclasses import dataclass
from typing import List
from app.models.briefing import Briefing, BriefingPoint, BriefingMetric
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

@dataclass
class ReportViewModel:
    title: str
    company_name: str
    ticker: str
    sector: str | None
    analyst_name: str | None
    summary: str
    recommendation: str
    key_points: List[str]
    risks: List[str]
    metrics: List[dict]
    generated_at: str

class ReportFormatter:
    async def format(self, session: AsyncSession, briefing: Briefing) -> ReportViewModel:
        key_points_stmt = select(BriefingPoint.content).where(BriefingPoint.briefing_id == briefing.id, BriefingPoint.type == 'key_point').order_by(BriefingPoint.display_order)
        risks_stmt = select(BriefingPoint.content).where(BriefingPoint.briefing_id == briefing.id, BriefingPoint.type == 'risk').order_by(BriefingPoint.display_order)
        metrics_stmt = select(BriefingMetric).where(BriefingMetric.briefing_id == briefing.id)
        key_points_result = await session.execute(key_points_stmt)
        risks_result = await session.execute(risks_stmt)
        metrics_result = await session.execute(metrics_stmt)
        key_points = [row[0] for row in key_points_result.all()]
        risks = [row[0] for row in risks_result.all()]
        metrics = [{"label": m.name, "value": m.value} for m in metrics_result.scalars()]
        generated_at = briefing.generated_at.strftime("%B %d, %Y at %I:%M %p UTC") if briefing.generated_at else ""
        return ReportViewModel(
            title=f"Briefing Report: {briefing.company_name} ({briefing.ticker})",
            company_name=briefing.company_name,
            ticker=briefing.ticker,
            sector=briefing.sector,
            analyst_name=briefing.analyst_name,
            summary=briefing.summary,
            recommendation=briefing.recommendation,
            key_points=key_points,
            risks=risks,
            metrics=metrics,
            generated_at=generated_at
        )