import math
import random
import csv
import io
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.kpi_service import KPIService

router = APIRouter(
    prefix="/api/kpi",
    tags=["kpi"]
)

@router.get("/summary")
async def get_kpi_summary(db: Session = Depends(get_db)):
    service = KPIService(db)
    return service.get_summary()

def _generate_sparkline(base: float, variance: float, length: int = 12) -> list[float]:
    """Generate a realistic sparkline data series."""
    points = []
    current = base
    for i in range(length):
        noise = random.uniform(-variance, variance)
        trend = math.sin(i / length * math.pi) * variance * 0.5
        current = max(0, base + trend + noise)
        points.append(round(current, 1))
    return points

@router.get("/enhanced")
async def get_enhanced_kpis(db: Session = Depends(get_db)):
    """Return enriched KPI data with sparklines, deltas, and breakdown."""
    service = KPIService(db)
    summary = service.get_summary()
    now = datetime.utcnow()

    # Mapping basic summary to the enhanced format expected by the UI
    return {
        "kpis": [
            {
                "id": "active_cases",
                "title": "Active Cases",
                "value": summary["total_active_cases"],
                "previous_value": 2542,
                "delta_percent": summary["case_change_pct"],
                "trend": "up" if summary["case_change_pct"] > 0 else "down",
                "icon": "🦠",
                "color": "danger" if summary["case_change_pct"] > 5 else "warning",
                "sparkline": _generate_sparkline(2800, 200),
                "breakdown": {"Dengue": 1200, "Malaria": 800, "Influenza": 847},
                "subtitle": "Across tracked pathogens",
            },
            {
                "id": "high_risk_regions",
                "title": "High Risk Regions",
                "value": summary["high_risk_regions"],
                "previous_value": 2,
                "delta_percent": 50.0,
                "trend": "up",
                "icon": "🚩",
                "color": "warning",
                "sparkline": [2, 2, 3, 3, 3, 2, 3, 3, 3, 3],
                "breakdown": {"Maharashtra": 92, "Delhi": 88, "Karnataka": 85},
                "subtitle": "Risk score > 65",
            },
            {
                "id": "active_alerts",
                "title": "Alerts Today",
                "value": summary["alerts_today"],
                "previous_value": 5,
                "delta_percent": 40.0,
                "trend": "up",
                "icon": "⚡",
                "color": "danger" if summary["alerts_today"] > 5 else "warning",
                "sparkline": [4, 5, 3, 6, 4, 7, 5, 8, 7, 7],
                "breakdown": {"Critical": 2, "High": 3, "Medium": 2},
                "subtitle": "Last 24 hours",
            },
            {
                "id": "prediction_accuracy",
                "title": "Model Accuracy",
                "value": summary["prediction_accuracy"],
                "previous_value": 85.2,
                "delta_percent": 2.2,
                "trend": "up",
                "icon": "🎯",
                "color": "success",
                "sparkline": [82, 83, 85, 84, 86, 85, 87, 87, 87],
                "breakdown": {"ARIMA": 84, "Prophet": 86, "LSTM": 89},
                "subtitle": "Ensemble performance",
            },
            {
                "id": "lives_protected",
                "title": "Lives Protected",
                "value": summary["lives_potentially_saved"],
                "previous_value": 1100,
                "delta_percent": 12.7,
                "trend": "up",
                "icon": "🛡️",
                "color": "success",
                "sparkline": [1000, 1050, 1100, 1150, 1200, 1240],
                "breakdown": {"Early Warning": 800, "Resource Opt": 440},
                "subtitle": "Estimated impact",
            },
            {
                "id": "avg_warning_lead",
                "title": "Avg. Warning Lead",
                "value": summary["days_ahead_warning"],
                "previous_value": 7.5,
                "delta_percent": 10.6,
                "trend": "up",
                "icon": "⏱️",
                "color": "success",
                "sparkline": [6, 7, 7.5, 8, 8.2, 8.3],
                "breakdown": {"Dengue": 10, "Malaria": 7, "Cholera": 8},
                "subtitle": "Days ahead lead time",
            },
        ],
        "last_updated": now.isoformat(),
    }

@router.get("/resources")
async def get_resource_allocation():
    """Return public health resource utilization metrics."""
    now = datetime.utcnow()

    return {
        "resources": [
            {
                "id": "hospital_beds",
                "name": "Hospital Beds",
                "icon": "🏥",
                "total": 45000,
                "utilized": 38250,
                "utilization_pct": 85.0,
                "status": "warning",
                "trend": _generate_sparkline(82, 4, 8),
                "regions": [
                    {"name": "Maharashtra", "total": 12000, "used": 10800, "pct": 90.0},
                    {"name": "Delhi", "total": 9500, "used": 8075, "pct": 85.0},
                ],
            },
            {
                "id": "icu_capacity",
                "name": "ICU Capacity",
                "icon": "🫀",
                "total": 5200,
                "utilized": 4680,
                "utilization_pct": 90.0,
                "status": "critical",
                "trend": _generate_sparkline(88, 3, 8),
                "regions": [
                    {"name": "Maharashtra", "total": 1400, "used": 1330, "pct": 95.0},
                ],
            }
        ],
        "last_updated": now.isoformat(),
    }
