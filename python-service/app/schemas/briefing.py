from pydantic import BaseModel, field_validator, ConfigDict
from typing import List
from pydantic import ValidationError

class MetricCreate(BaseModel):
    name: str
    value: str

class BriefingCreate(BaseModel):
    companyName: str
    ticker: str
    sector: str | None = None
    analystName: str | None = None
    summary: str
    recommendation: str
    keyPoints: List[str]
    risks: List[str]
    metrics: List[MetricCreate]

    @field_validator("ticker", mode="before")
    @classmethod
    def uppercase_ticker(cls, v):
        return v.upper()

    @field_validator("keyPoints")
    @classmethod
    def validate_key_points(cls, v):
        if len(v) < 2:
            raise ValueError("keyPoints must have at least 2 items")
        return v

    @field_validator("risks")
    @classmethod
    def validate_risks(cls, v):
        if len(v) < 1:
            raise ValueError("risks must have at least 1 item")
        return v

    @field_validator("metrics")
    @classmethod
    def validate_unique_metrics(cls, v):
        names = [m.name for m in v]
        if len(names) != len(set(names)):
            raise ValueError("metrics names must be unique")
        return v

class BriefingPointResponse(BaseModel):
    type: str
    content: str
    display_order: int

class BriefingMetricResponse(BaseModel):
    name: str
    value: str

class BriefingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    company_name: str
    ticker: str
    sector: str | None
    analyst_name: str | None
    summary: str
    recommendation: str
    is_generated: bool
    generated_at: str | None
    created_at: str
    key_points: List[str]
    risks: List[str]
    metrics: List[BriefingMetricResponse]