from fastapi import FastAPI
from app.routers.briefings import router

app = FastAPI()
app.include_router(router)