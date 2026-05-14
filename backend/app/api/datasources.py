"""
Helix Phase 19 — Data Sources & Reports API
Provides detailed data pipeline health, ingestion statistics,
data quality metrics, and report generation capabilities.
"""

import random
from datetime import datetime, timedelta
from fastapi import APIRouter

router = APIRouter(
    prefix="/api/datasources",
    tags=["datasources"]
)


@router.get("/pipeline")
async def get_pipeline_status():
    """Full data pipeline health and ingestion statistics."""
    now = datetime.utcnow()

    return {
        "pipelines": [
            {
                "id": "who_gho",
                "name": "WHO Global Health Observatory",
                "type": "Historical",
                "icon": "🌍",
                "status": "active",
                "records_total": 487200,
                "records_today": 1240,
                "freshness_hours": 2.4,
                "quality_score": 96.8,
                "schema_version": "v3.2",
                "last_sync": (now - timedelta(hours=2, minutes=24)).isoformat(),
                "next_sync": (now + timedelta(hours=3, minutes=36)).isoformat(),
                "throughput_rps": 145,
                "error_rate_pct": 0.02,
                "ingestion_history": [
                    {"hour": f"-{i}h", "records": random.randint(800, 1500)}
                    for i in range(12, 0, -1)
                ],
            },
            {
                "id": "openweather",
                "name": "OpenWeatherMap API",
                "type": "Environmental",
                "icon": "🌦️",
                "status": "active",
                "records_total": 234500,
                "records_today": 4820,
                "freshness_hours": 0.5,
                "quality_score": 94.2,
                "schema_version": "v2.5",
                "last_sync": (now - timedelta(minutes=30)).isoformat(),
                "next_sync": (now + timedelta(minutes=30)).isoformat(),
                "throughput_rps": 280,
                "error_rate_pct": 0.15,
                "ingestion_history": [
                    {"hour": f"-{i}h", "records": random.randint(300, 500)}
                    for i in range(12, 0, -1)
                ],
            },
            {
                "id": "symptom_reports",
                "name": "Anonymized Symptom Reports",
                "type": "Real-time",
                "icon": "🩺",
                "status": "active",
                "records_total": 89400,
                "records_today": 342,
                "freshness_hours": 0.1,
                "quality_score": 91.5,
                "schema_version": "v1.4",
                "last_sync": (now - timedelta(minutes=6)).isoformat(),
                "next_sync": (now + timedelta(minutes=5)).isoformat(),
                "throughput_rps": 45,
                "error_rate_pct": 0.8,
                "ingestion_history": [
                    {"hour": f"-{i}h", "records": random.randint(20, 50)}
                    for i in range(12, 0, -1)
                ],
            },
            {
                "id": "wearable_telemetry",
                "name": "Wearable Telemetry Stream",
                "type": "Real-time",
                "icon": "⌚",
                "status": "degraded",
                "records_total": 1245000,
                "records_today": 28400,
                "freshness_hours": 0.02,
                "quality_score": 87.3,
                "schema_version": "v1.1",
                "last_sync": (now - timedelta(seconds=45)).isoformat(),
                "next_sync": (now + timedelta(seconds=10)).isoformat(),
                "throughput_rps": 520,
                "error_rate_pct": 2.1,
                "ingestion_history": [
                    {"hour": f"-{i}h", "records": random.randint(2000, 3000)}
                    for i in range(12, 0, -1)
                ],
            },
            {
                "id": "synthetic_outbreak",
                "name": "Synthetic Outbreak Dataset",
                "type": "Historical",
                "icon": "🧪",
                "status": "active",
                "records_total": 7800,
                "records_today": 0,
                "freshness_hours": 720,
                "quality_score": 99.9,
                "schema_version": "v1.0",
                "last_sync": (now - timedelta(days=30)).isoformat(),
                "next_sync": None,
                "throughput_rps": 0,
                "error_rate_pct": 0.0,
                "ingestion_history": [
                    {"hour": f"-{i}h", "records": 0}
                    for i in range(12, 0, -1)
                ],
            },
            {
                "id": "mediapipe_cv",
                "name": "MediaPipe CV Analysis",
                "type": "On-demand",
                "icon": "📷",
                "status": "standby",
                "records_total": 1240,
                "records_today": 18,
                "freshness_hours": 0.3,
                "quality_score": 92.1,
                "schema_version": "v1.0",
                "last_sync": (now - timedelta(minutes=18)).isoformat(),
                "next_sync": None,
                "throughput_rps": 8,
                "error_rate_pct": 1.2,
                "ingestion_history": [
                    {"hour": f"-{i}h", "records": random.randint(0, 5)}
                    for i in range(12, 0, -1)
                ],
            },
        ],
        "aggregate": {
            "total_records": 2064140,
            "records_ingested_today": 34820,
            "active_pipelines": 4,
            "degraded_pipelines": 1,
            "standby_pipelines": 1,
            "avg_quality_score": 93.6,
            "total_throughput_rps": 998,
            "storage_used_gb": 4.2,
            "storage_total_gb": 50.0,
        },
        "data_quality": {
            "completeness": 96.2,
            "accuracy": 94.8,
            "consistency": 97.1,
            "timeliness": 92.5,
            "validity": 98.3,
        },
        "last_updated": now.isoformat(),
    }


@router.get("/reports")
async def get_available_reports():
    """List of generated and available reports."""
    now = datetime.utcnow()

    return {
        "reports": [
            {
                "id": "RPT-001",
                "title": "Weekly Outbreak Intelligence Briefing",
                "type": "Scheduled",
                "frequency": "Weekly",
                "last_generated": (now - timedelta(days=2)).isoformat(),
                "status": "ready",
                "pages": 12,
                "format": "PDF",
                "sections": ["Executive Summary", "Regional Analysis", "Model Performance", "Recommendations"],
            },
            {
                "id": "RPT-002",
                "title": "Daily Alert Digest",
                "type": "Scheduled",
                "frequency": "Daily",
                "last_generated": (now - timedelta(hours=6)).isoformat(),
                "status": "ready",
                "pages": 4,
                "format": "PDF",
                "sections": ["Active Alerts", "New Cases", "Response Actions"],
            },
            {
                "id": "RPT-003",
                "title": "Model Validation & Accuracy Report",
                "type": "On-Demand",
                "frequency": "On-Demand",
                "last_generated": (now - timedelta(days=1)).isoformat(),
                "status": "ready",
                "pages": 18,
                "format": "PDF",
                "sections": ["ARIMA Metrics", "Prophet Metrics", "LSTM Metrics", "Ensemble Analysis", "ROC Curves"],
            },
            {
                "id": "RPT-004",
                "title": "Resource Utilization Summary",
                "type": "Scheduled",
                "frequency": "Weekly",
                "last_generated": (now - timedelta(days=3)).isoformat(),
                "status": "ready",
                "pages": 8,
                "format": "PDF",
                "sections": ["Hospital Capacity", "Vaccine Supply", "Team Deployment", "Budget Analysis"],
            },
            {
                "id": "RPT-005",
                "title": "Environmental Correlation Analysis",
                "type": "On-Demand",
                "frequency": "On-Demand",
                "last_generated": (now - timedelta(days=5)).isoformat(),
                "status": "ready",
                "pages": 14,
                "format": "PDF",
                "sections": ["Weather Patterns", "Disease Correlations", "Lag Analysis", "Seasonal Risks"],
            },
            {
                "id": "RPT-006",
                "title": "Stakeholder Executive Brief",
                "type": "Monthly",
                "frequency": "Monthly",
                "last_generated": (now - timedelta(days=14)).isoformat(),
                "status": "generating",
                "pages": 24,
                "format": "PDF",
                "sections": ["Platform Overview", "Impact Metrics", "Cost Savings", "Future Roadmap"],
            },
        ],
        "last_updated": now.isoformat(),
    }
