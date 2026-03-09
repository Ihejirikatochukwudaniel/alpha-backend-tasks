from fastapi import FastAPI
from app.routers.briefings import router
from app.database import engine
from app.models.briefing import Base

app = FastAPI()

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(router)