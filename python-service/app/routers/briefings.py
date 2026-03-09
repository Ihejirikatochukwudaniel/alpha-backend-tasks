from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi.responses import HTMLResponse
from jinja2 import Environment, FileSystemLoader
import os

from app.database import get_session
from app.schemas.briefing import BriefingCreate, BriefingResponse
from app.services.briefing_service import create_briefing, get_briefing, save_generated_report
from app.formatters.report_formatter import ReportFormatter
from app.models.briefing import Briefing, BriefingPoint, BriefingMetric

router = APIRouter()
formatter = ReportFormatter()
template_dir = os.path.join(os.path.dirname(__file__), '..', 'templates')
env = Environment(loader=FileSystemLoader(template_dir), autoescape=True)
template = env.get_template('report.html')


@router.post("/briefings", response_model=BriefingResponse)
async def create_briefing_endpoint(data: BriefingCreate, session: AsyncSession = Depends(get_session)):
    briefing = await create_briefing(session, data)
    response = await get_full_briefing_response(session, briefing.id)
    return response


@router.get("/briefings/{briefing_id}", response_model=BriefingResponse)
async def get_briefing_endpoint(briefing_id: str, session: AsyncSession = Depends(get_session)):
    response = await get_full_briefing_response(session, briefing_id)
    if not response:
        raise HTTPException(status_code=404, detail="Briefing not found")
    return response


@router.post("/briefings/{briefing_id}/generate")
async def generate_report_endpoint(briefing_id: str, session: AsyncSession = Depends(get_session)):
    briefing = await get_briefing(session, briefing_id)
    if not briefing:
        raise HTTPException(status_code=404, detail="Briefing not found")
    vm = await formatter.format(session, briefing)
    html = template.render(**vm.__dict__)
    await save_generated_report(session, briefing, html)
    return {"message": "Report generated"}


@router.get("/briefings/{briefing_id}/html", response_class=HTMLResponse)
async def get_html_endpoint(briefing_id: str, session: AsyncSession = Depends(get_session)):
    briefing = await get_briefing(session, briefing_id)
    if not briefing or not briefing.is_generated:
        raise HTTPException(status_code=404, detail="Report not generated")
    return briefing.html_content


async def get_full_briefing_response(session: AsyncSession, briefing_id: str) -> BriefingResponse | None:
    stmt = select(Briefing).where(Briefing.id == briefing_id)
    result = await session.execute(stmt)
    briefing = result.scalar_one_or_none()

    if not briefing:
        return None

    kp_stmt = (
        select(BriefingPoint.content)
        .where(BriefingPoint.briefing_id == briefing_id, BriefingPoint.type == "key_point")
        .order_by(BriefingPoint.display_order)
    )
    r_stmt = (
        select(BriefingPoint.content)
        .where(BriefingPoint.briefing_id == briefing_id, BriefingPoint.type == "risk")
        .order_by(BriefingPoint.display_order)
    )
    m_stmt = select(BriefingMetric).where(BriefingMetric.briefing_id == briefing_id)

    kp_result = await session.execute(kp_stmt)
    r_result = await session.execute(r_stmt)
    m_result = await session.execute(m_stmt)

    key_points = [row[0] for row in kp_result.all()]
    risks = [row[0] for row in r_result.all()]
    metrics = [{"name": m.name, "value": m.value} for m in m_result.scalars()]

    return BriefingResponse(
        id=str(briefing.id),
        company_name=briefing.company_name,
        ticker=briefing.ticker,
        sector=briefing.sector,
        analyst_name=briefing.analyst_name,
        summary=briefing.summary,
        recommendation=briefing.recommendation,
        is_generated=briefing.is_generated,
        generated_at=briefing.generated_at.isoformat() if briefing.generated_at else None,
        created_at=briefing.created_at.isoformat(),
        key_points=key_points,
        risks=risks,
        metrics=metrics,
    )