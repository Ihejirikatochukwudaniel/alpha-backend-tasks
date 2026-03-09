from sqlalchemy.ext.asyncio import AsyncSession
from app.models.briefing import Briefing, BriefingPoint, BriefingMetric
from app.schemas.briefing import BriefingCreate
from sqlalchemy import select
from uuid import UUID
from datetime import datetime

async def create_briefing(session: AsyncSession, data: BriefingCreate) -> Briefing:
    briefing = Briefing(
        company_name=data.companyName,
        ticker=data.ticker,
        sector=data.sector,
        analyst_name=data.analystName,
        summary=data.summary,
        recommendation=data.recommendation
    )
    session.add(briefing)
    await session.flush()
    for i, point in enumerate(data.keyPoints):
        bp = BriefingPoint(briefing_id=briefing.id, type='key_point', content=point, display_order=i)
        session.add(bp)
    for i, risk in enumerate(data.risks):
        bp = BriefingPoint(briefing_id=briefing.id, type='risk', content=risk, display_order=i)
        session.add(bp)
    for metric in data.metrics:
        bm = BriefingMetric(briefing_id=briefing.id, name=metric.name, value=metric.value)
        session.add(bm)
    await session.commit()
    return briefing

async def get_briefing(session: AsyncSession, briefing_id: UUID) -> Briefing | None:
    stmt = select(Briefing).where(Briefing.id == briefing_id)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()

async def save_generated_report(session: AsyncSession, briefing: Briefing, html: str) -> None:
    briefing.html_content = html
    briefing.is_generated = True
    briefing.generated_at = datetime.utcnow()
    await session.commit()