import os
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict

from ..database import get_db
from ..models.models import UserSymptomReport
# Assuming we can access outbreak data from the CSV/Parquet or DB
# For summary, we'll aggregate from existing sources

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)

@router.get("/summary")
async def get_dashboard_summary(db: Session = Depends(get_db)):
    # 1. Total Active Cases (Simulated aggregation)
    # In real app, sum(last_week_cases) for all diseases
    total_active_cases = 124500 # placeholder
    
    # 2. High Risk Regions
    # Regions with risk > 80% or many symptom reports
    high_risk_regions = ["Maharashtra", "Delhi"]
    
    # 3. Alerts Today
    # Count of spikes or threshold breaches
    alerts_today = 3
    
    # 4. Prediction Accuracy
    # Mean RMSE across models (placeholder)
    prediction_accuracy = 92.4 # percent
    
    # 5. Region Risk Matrix
    # { region: { disease: risk_score } }
    diseases = ["Dengue", "Malaria", "Cholera", "Influenza", "COVID-19"]
    regions = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Kerala"]
    
    risk_matrix = {}
    for r in regions:
        risk_matrix[r] = {}
        for d in diseases:
            # Placeholder: deterministic but varying values
            seed = sum(ord(c) for c in r) + sum(ord(c) for c in d)
            risk_matrix[r][d] = (seed % 100)
            
    return {
        "total_active_cases": total_active_cases,
        "high_risk_regions": high_risk_regions,
        "alerts_today": alerts_today,
        "prediction_accuracy": prediction_accuracy,
        "region_risk_matrix": risk_matrix,
        "last_updated": datetime.utcnow().isoformat()
    }
