import os
import json
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional

from ..database import get_db
from ..models.models import UserSymptomReport
from ..schemas.symptoms import SymptomReportCreate, SymptomReportResponse, SymptomSummary

router = APIRouter(
    prefix="/api/symptoms",
    tags=["symptoms"]
)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:8001")

def get_triage_score(symptoms: List[str], severity: int):
    # Rule-based triage scoring (Phase 9)
    critical_symptoms = ["Shortness of Breath", "Chest Pain", "Loss of Consciousness", "Severe Bleeding"]
    urgent_symptoms = ["Fever", "Vomiting", "Severe Headache", "Rash"]
    
    # Check for critical symptoms
    if any(s in symptoms for s in critical_symptoms) or severity >= 5:
        return "CRITICAL (Immediate ER)"
    
    # Check for urgent symptoms
    if any(s in symptoms for s in urgent_symptoms) or severity >= 3:
        return "URGENT (Consult Doctor)"
    
    if severity >= 2:
        return "NON-URGENT (Clinic Visit)"
        
    return "SELF-CARE (Monitor at home)"

@router.post("/report", response_model=SymptomReportResponse)
async def report_symptoms(report: SymptomReportCreate, db: Session = Depends(get_db)):
    # 1. Classification via ML Service
    try:
        async with httpx.AsyncClient() as client:
            ml_res = await client.post(
                f"{ML_SERVICE_URL}/api/symptoms/classify",
                json={"symptoms": report.symptoms},
                timeout=5.0
            )
            ml_res.raise_for_status()
            classification = ml_res.json()
    except Exception as e:
        # Fallback if ML service is down
        classification = {"disease": "Unknown", "confidence": 0.0, "risk_level": "low"}

    # 2. Triage Logic (Phase 9)
    triage = get_triage_score(report.symptoms, report.severity)

    # 3. Anonymize and Save to DB
    db_report = UserSymptomReport(
        timestamp=report.timestamp or datetime.utcnow(),
        user_id_hash="anonymous",
        region=report.region,
        symptoms=json.dumps(report.symptoms),
        severity=report.severity,
        age_group=report.age_group,
        reported_disease=classification['disease'],
        risk_score=classification['confidence'] * 100
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return {
        "report_id": db_report.id,
        "risk_level": classification['risk_level'],
        "estimated_disease": classification['disease'],
        "confidence": classification['confidence'],
        "triage_recommendation": triage # Added in Phase 9
    }

@router.get("/summary", response_model=List[SymptomSummary])
def get_symptom_summary(db: Session = Depends(get_db)):
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    reports = db.query(UserSymptomReport).filter(UserSymptomReport.timestamp >= seven_days_ago).all()
    
    summary = {}
    for r in reports:
        symptoms = json.loads(r.symptoms)
        key = (r.region, symptoms[0] if symptoms else "Unknown")
        summary[key] = summary.get(key, 0) + 1
        
    return [
        {"region": k[0], "symptom_type": k[1], "count": v}
        for k, v in summary.items()
    ]
