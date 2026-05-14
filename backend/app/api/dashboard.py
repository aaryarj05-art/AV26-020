import os
import json
import csv
import io
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict

from ..database import get_db
from ..models.models import UserSymptomReport, OutbreakRecord
from ..services.kpi_service import KPIService

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)

@router.get("/summary")
async def get_dashboard_summary(db: Session = Depends(get_db)):
    service = KPIService(db)
    summary = service.get_summary()
    
    # Keeping the region risk matrix for other components
    diseases = ["Dengue", "Malaria", "Cholera", "Influenza", "COVID-19"]
    regions = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Kerala"]
    
    risk_matrix = {}
    for r in regions:
        risk_matrix[r] = {}
        for d in diseases:
            seed = sum(ord(c) for c in r) + sum(ord(c) for c in d)
            risk_matrix[r][d] = (seed % 100)
            
    return {
        **summary,
        "region_risk_matrix": risk_matrix,
        "last_updated": datetime.utcnow().isoformat()
    }

@router.get("/export")
async def export_dashboard_data(db: Session = Depends(get_db)):
    service = KPIService(db)
    summary = service.get_summary()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Metric", "Value"])
    for key, value in summary.items():
        writer.writerow([key, value])
    
    content = output.getvalue()
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=helix_dashboard_export_{datetime.now().strftime('%Y%m%d')}.csv"}
    )
