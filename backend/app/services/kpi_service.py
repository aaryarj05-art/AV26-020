import math
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.models import OutbreakRecord, AlertLog, UserSymptomReport

class KPIService:
    def __init__(self, db: Session):
        self.db = db

    def get_summary(self):
        # 1. Total Active Cases (current week)
        # For simplicity in this mock-heavy hackathon, we fetch the most recent records
        current_week_cases = self.db.query(func.sum(OutbreakRecord.cases)).filter(
            OutbreakRecord.date >= datetime.utcnow() - timedelta(days=7)
        ).scalar() or 2847 # Fallback to user requested mock value if DB empty

        # 2. Case Change Pct
        last_week_cases = self.db.query(func.sum(OutbreakRecord.cases)).filter(
            OutbreakRecord.date >= datetime.utcnow() - timedelta(days=14),
            OutbreakRecord.date < datetime.utcnow() - timedelta(days=7)
        ).scalar() or 2542

        if last_week_cases > 0:
            case_change_pct = ((current_week_cases - last_week_cases) / last_week_cases) * 100
        else:
            case_change_pct = 12.0

        # 3. High Risk Regions (risk > 65)
        # In a real app, we'd query a risk table. Here we'll simulate based on recent symptom reports or outbreak records
        high_risk_count = 3 # Simulated for hackathon

        # 4. Alerts Today (last 24h)
        alerts_today = self.db.query(AlertLog).filter(
            AlertLog.timestamp >= datetime.utcnow() - timedelta(days=1)
        ).count() or 7

        # 5. Prediction Accuracy
        # Mocking based on ensemble RMSE
        prediction_accuracy = 87.4

        # 6. Lives Potentially Saved
        # Formula: alerts_sent × avg_response_improvement_days × 0.1
        total_alerts = self.db.query(AlertLog).count() or 124
        avg_response_improvement = 10 # days
        lives_saved = int(total_alerts * avg_response_improvement * 0.1) or 1240

        # 7. Days Ahead Warning
        days_ahead = 8.3

        return {
            "total_active_cases": int(current_week_cases),
            "case_change_pct": round(case_change_pct, 1),
            "high_risk_regions": high_risk_count,
            "alerts_today": alerts_today,
            "prediction_accuracy": prediction_accuracy,
            "lives_potentially_saved": lives_saved,
            "days_ahead_warning": days_ahead,
            "last_updated": datetime.utcnow().isoformat()
        }
