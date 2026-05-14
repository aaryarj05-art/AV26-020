from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class OutbreakRecordBase(BaseModel):
    date: datetime
    region: str
    disease: str
    cases: int
    deaths: int
    recovered: int
    population: int
    week_of_year: int
    month: int
    is_monsoon_season: int
    rolling_7day_avg: float
    rolling_30day_avg: float

class OutbreakRecord(OutbreakRecordBase):
    id: int
    last_updated: datetime

    class Config:
        from_attributes = True

class DataStatus(BaseModel):
    record_count: int
    last_updated: datetime
