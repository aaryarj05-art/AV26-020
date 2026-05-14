"""
Helix Phase 17 — Enhanced KPI & Resource Allocation API
Provides enriched dashboard KPIs with sparkline data, trend deltas,
and public health resource utilization metrics.
"""

import math
import random
from datetime import datetime, timedelta
from fastapi import APIRouter

router = APIRouter(
    prefix="/api/kpi",
    tags=["kpi"]
)


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
async def get_enhanced_kpis():
    """Return enriched KPI data with sparklines, deltas, and breakdown."""
    now = datetime.utcnow()

    return {
        "kpis": [
            {
                "id": "active_cases",
                "title": "Active Cases",
                "value": 124500,
                "previous_value": 118200,
                "delta_percent": 5.3,
                "trend": "up",
                "icon": "🦠",
                "color": "danger",
                "sparkline": _generate_sparkline(120000, 8000),
                "breakdown": {
                    "Dengue": 42300,
                    "Malaria": 31200,
                    "Cholera": 18500,
                    "Influenza": 22100,
                    "COVID-19": 10400,
                },
                "subtitle": "Across 5 tracked pathogens",
            },
            {
                "id": "high_risk_zones",
                "title": "High Risk Zones",
                "value": 7,
                "previous_value": 5,
                "delta_percent": 40.0,
                "trend": "up",
                "icon": "🚩",
                "color": "warning",
                "sparkline": _generate_sparkline(5, 2),
                "breakdown": {
                    "Maharashtra": 92,
                    "Delhi": 88,
                    "Karnataka": 85,
                    "Tamil Nadu": 82,
                    "Kerala": 81,
                    "Gujarat": 80,
                    "Rajasthan": 78,
                },
                "subtitle": "Regions with risk score > 80%",
            },
            {
                "id": "active_alerts",
                "title": "Active Alerts",
                "value": 12,
                "previous_value": 8,
                "delta_percent": 50.0,
                "trend": "up",
                "icon": "🔔",
                "color": "danger",
                "sparkline": _generate_sparkline(8, 4),
                "breakdown": {
                    "Critical": 2,
                    "High": 4,
                    "Medium": 3,
                    "Low": 3,
                },
                "subtitle": "3 critical requiring immediate action",
            },
            {
                "id": "prediction_accuracy",
                "title": "Model Accuracy",
                "value": 92.4,
                "previous_value": 91.1,
                "delta_percent": 1.4,
                "trend": "up",
                "icon": "🎯",
                "color": "success",
                "sparkline": _generate_sparkline(91, 2),
                "breakdown": {
                    "ARIMA": 89.2,
                    "Prophet": 91.8,
                    "LSTM": 94.1,
                    "Ensemble": 92.4,
                },
                "subtitle": "Weighted ensemble across 3 models",
            },
            {
                "id": "outbreak_velocity",
                "title": "Outbreak Velocity",
                "value": 2.4,
                "previous_value": 3.1,
                "delta_percent": -22.6,
                "trend": "down",
                "icon": "📈",
                "color": "warning",
                "sparkline": _generate_sparkline(3, 1),
                "breakdown": {
                    "Dengue": 3.2,
                    "Malaria": 1.8,
                    "Cholera": 2.9,
                    "Influenza": 1.4,
                    "COVID-19": 2.7,
                },
                "subtitle": "Avg daily Rt (reproduction rate)",
            },
            {
                "id": "response_coverage",
                "title": "Response Coverage",
                "value": 78.5,
                "previous_value": 72.3,
                "delta_percent": 8.6,
                "trend": "up",
                "icon": "🛡️",
                "color": "success",
                "sparkline": _generate_sparkline(75, 5),
                "breakdown": {
                    "Surveillance": 92,
                    "Treatment": 81,
                    "Prevention": 74,
                    "Logistics": 67,
                },
                "subtitle": "Public health response readiness",
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
                    {"name": "Karnataka", "total": 8000, "used": 6400, "pct": 80.0},
                    {"name": "Tamil Nadu", "total": 8500, "used": 7225, "pct": 85.0},
                    {"name": "Kerala", "total": 7000, "used": 5750, "pct": 82.1},
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
                    {"name": "Delhi", "total": 1100, "used": 990, "pct": 90.0},
                    {"name": "Karnataka", "total": 900, "used": 810, "pct": 90.0},
                    {"name": "Tamil Nadu", "total": 1000, "used": 880, "pct": 88.0},
                    {"name": "Kerala", "total": 800, "used": 670, "pct": 83.8},
                ],
            },
            {
                "id": "ventilators",
                "name": "Ventilators",
                "icon": "💨",
                "total": 3800,
                "utilized": 2660,
                "utilization_pct": 70.0,
                "status": "normal",
                "trend": _generate_sparkline(68, 5, 8),
                "regions": [
                    {"name": "Maharashtra", "total": 1000, "used": 750, "pct": 75.0},
                    {"name": "Delhi", "total": 850, "used": 595, "pct": 70.0},
                    {"name": "Karnataka", "total": 650, "used": 455, "pct": 70.0},
                    {"name": "Tamil Nadu", "total": 700, "used": 476, "pct": 68.0},
                    {"name": "Kerala", "total": 600, "used": 384, "pct": 64.0},
                ],
            },
            {
                "id": "vaccine_doses",
                "name": "Vaccine Stock",
                "icon": "💉",
                "total": 2800000,
                "utilized": 1960000,
                "utilization_pct": 70.0,
                "status": "normal",
                "trend": _generate_sparkline(65, 8, 8),
                "regions": [
                    {"name": "Maharashtra", "total": 750000, "used": 562500, "pct": 75.0},
                    {"name": "Delhi", "total": 600000, "used": 420000, "pct": 70.0},
                    {"name": "Karnataka", "total": 500000, "used": 350000, "pct": 70.0},
                    {"name": "Tamil Nadu", "total": 520000, "used": 338000, "pct": 65.0},
                    {"name": "Kerala", "total": 430000, "used": 289500, "pct": 67.3},
                ],
            },
            {
                "id": "medical_teams",
                "name": "Medical Teams",
                "icon": "👨‍⚕️",
                "total": 1200,
                "utilized": 840,
                "utilization_pct": 70.0,
                "status": "normal",
                "trend": _generate_sparkline(68, 6, 8),
                "regions": [
                    {"name": "Maharashtra", "total": 320, "used": 256, "pct": 80.0},
                    {"name": "Delhi", "total": 280, "used": 196, "pct": 70.0},
                    {"name": "Karnataka", "total": 220, "used": 154, "pct": 70.0},
                    {"name": "Tamil Nadu", "total": 200, "used": 130, "pct": 65.0},
                    {"name": "Kerala", "total": 180, "used": 104, "pct": 57.8},
                ],
            },
            {
                "id": "ambulances",
                "name": "Ambulance Fleet",
                "icon": "🚑",
                "total": 800,
                "utilized": 520,
                "utilization_pct": 65.0,
                "status": "normal",
                "trend": _generate_sparkline(62, 7, 8),
                "regions": [
                    {"name": "Maharashtra", "total": 220, "used": 154, "pct": 70.0},
                    {"name": "Delhi", "total": 180, "used": 126, "pct": 70.0},
                    {"name": "Karnataka", "total": 150, "used": 90, "pct": 60.0},
                    {"name": "Tamil Nadu", "total": 140, "used": 84, "pct": 60.0},
                    {"name": "Kerala", "total": 110, "used": 66, "pct": 60.0},
                ],
            },
        ],
        "summary": {
            "total_budget_allocated": 42500000,
            "budget_utilized": 31875000,
            "budget_utilization_pct": 75.0,
            "personnel_deployed": 840,
            "supply_chain_status": "Operational",
            "last_resupply": (now - timedelta(hours=6)).isoformat(),
            "next_resupply_eta": (now + timedelta(hours=18)).isoformat(),
        },
        "last_updated": now.isoformat(),
    }
