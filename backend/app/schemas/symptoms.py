from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SymptomReportCreate(BaseModel):
    region: str
    symptoms: List[str]
    severity: int
    age_group: str
    timestamp: Optional[datetime] = None

class SymptomReportResponse(BaseModel):
    report_id: int
    risk_level: str
    estimated_disease: str
    confidence: float

class SymptomSummary(BaseModel):
    region: str
    symptom_type: str
    count: int
