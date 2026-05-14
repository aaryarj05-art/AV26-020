"""
Helix Phase 18 — Operations Command Center API
Provides real-time operational intelligence: system health, 
active deployments, response team status, and region-level situational awareness.
"""

import random
from datetime import datetime, timedelta
from fastapi import APIRouter

router = APIRouter(
    prefix="/api/operations",
    tags=["operations"]
)


@router.get("/status")
async def get_operations_status():
    """Full situational awareness payload for the Operations Command Center."""
    now = datetime.utcnow()

    return {
        "system_health": {
            "backend_api": {"status": "operational", "latency_ms": 12, "uptime_pct": 99.97},
            "ml_engine": {"status": "operational", "latency_ms": 45, "uptime_pct": 99.82},
            "data_pipeline": {"status": "operational", "latency_ms": 8, "uptime_pct": 99.99},
            "alert_engine": {"status": "operational", "latency_ms": 22, "uptime_pct": 99.91},
            "wearable_ingest": {"status": "degraded", "latency_ms": 180, "uptime_pct": 98.4},
            "fusion_engine": {"status": "operational", "latency_ms": 35, "uptime_pct": 99.88},
        },
        "active_missions": [
            {
                "id": "OP-2026-041",
                "name": "Dengue Surge — Maharashtra",
                "severity": "critical",
                "region": "Maharashtra",
                "teams_deployed": 12,
                "cases_managed": 4200,
                "started": (now - timedelta(days=3)).isoformat(),
                "status": "active",
                "progress": 62,
            },
            {
                "id": "OP-2026-039",
                "name": "Cholera Containment — Delhi NCR",
                "severity": "high",
                "region": "Delhi",
                "teams_deployed": 8,
                "cases_managed": 1850,
                "started": (now - timedelta(days=5)).isoformat(),
                "status": "active",
                "progress": 78,
            },
            {
                "id": "OP-2026-042",
                "name": "Malaria Monitoring — Karnataka",
                "severity": "medium",
                "region": "Karnataka",
                "teams_deployed": 4,
                "cases_managed": 890,
                "started": (now - timedelta(days=1)).isoformat(),
                "status": "active",
                "progress": 35,
            },
            {
                "id": "OP-2026-037",
                "name": "Influenza Vaccination Drive — Kerala",
                "severity": "low",
                "region": "Kerala",
                "teams_deployed": 6,
                "cases_managed": 3100,
                "started": (now - timedelta(days=8)).isoformat(),
                "status": "winding_down",
                "progress": 92,
            },
        ],
        "response_metrics": {
            "avg_response_time_mins": 18,
            "cases_resolved_today": 342,
            "new_cases_today": 287,
            "resolution_rate": 83.5,
            "field_teams_active": 30,
            "field_teams_total": 42,
            "supply_deliveries_today": 14,
            "regions_under_watch": 7,
        },
        "activity_feed": [
            {"time": (now - timedelta(minutes=2)).isoformat(), "event": "Alert Engine triggered CRITICAL for Maharashtra — Dengue risk at 94%", "type": "critical"},
            {"time": (now - timedelta(minutes=8)).isoformat(), "event": "Vaccine resupply shipment dispatched to Delhi NCR (12,000 doses)", "type": "info"},
            {"time": (now - timedelta(minutes=15)).isoformat(), "event": "LSTM model retrained — accuracy improved to 94.3% (+0.2%)", "type": "success"},
            {"time": (now - timedelta(minutes=22)).isoformat(), "event": "Field Team Alpha-7 deployed to Pune district — 3 medics", "type": "info"},
            {"time": (now - timedelta(minutes=35)).isoformat(), "event": "Wearable telemetry latency spike detected — investigating", "type": "warning"},
            {"time": (now - timedelta(minutes=48)).isoformat(), "event": "Symptom cluster detected in Tamil Nadu — DBSCAN flagged 23 reports", "type": "warning"},
            {"time": (now - timedelta(minutes=60)).isoformat(), "event": "Cholera containment in Delhi reached 78% progress", "type": "success"},
            {"time": (now - timedelta(minutes=90)).isoformat(), "event": "Environmental correlation updated — Rainfall anomaly in Karnataka", "type": "info"},
        ],
        "region_sitrep": [
            {"region": "Maharashtra", "threat_level": "critical", "active_cases": 42300, "trend": "rising", "response_score": 72},
            {"region": "Delhi", "threat_level": "high", "active_cases": 28100, "trend": "stable", "response_score": 81},
            {"region": "Karnataka", "threat_level": "medium", "active_cases": 15600, "trend": "rising", "response_score": 68},
            {"region": "Tamil Nadu", "threat_level": "medium", "active_cases": 12400, "trend": "declining", "response_score": 85},
            {"region": "Kerala", "threat_level": "low", "active_cases": 8900, "trend": "declining", "response_score": 91},
            {"region": "Gujarat", "threat_level": "medium", "active_cases": 11200, "trend": "stable", "response_score": 74},
            {"region": "Rajasthan", "threat_level": "low", "active_cases": 6800, "trend": "declining", "response_score": 88},
        ],
        "last_updated": now.isoformat(),
    }
