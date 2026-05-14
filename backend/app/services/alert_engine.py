import os
import httpx
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.models import AlertLog, UserSymptomReport
from .notification_service import NotificationService

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8001")

REGIONS = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Kerala"]
DISEASES = ["Dengue", "Malaria", "Cholera", "Influenza", "COVID-19"]

class AlertEngine:
    def __init__(self, db: Session):
        self.db = db
        self.notifier = NotificationService(db)

    async def check_all_regions(self):
        print(f"[ALERT_ENGINE] Scanning {len(REGIONS)} regions for 5 pathogens...")
        
        async with httpx.AsyncClient() as client:
            for region in REGIONS:
                for disease in DISEASES:
                    try:
                        # 1. Fetch risk score from ML service
                        res = await client.get(
                            f"{ML_SERVICE_URL}/api/predict/risk-score",
                            params={"disease": disease, "region": region},
                            timeout=5.0
                        )
                        risk_data = res.json()
                        risk_score = risk_data.get('risk_score', 0)
                        
                        # 2. Fetch recent symptom report spike (mocked logic for engine)
                        # Normally we'd call /api/symptoms/spikes
                        spike_zscore = 0
                        if risk_score > 70: spike_zscore = 2.5 # Simulating correlation
                        
                        # 3. Evaluate Trigger Rules
                        severity = None
                        if risk_score > 85 or spike_zscore > 3:
                            severity = "CRITICAL"
                        elif risk_score > 65:
                            severity = "HIGH"
                        elif risk_score > 40:
                            severity = "MEDIUM"
                        elif risk_score > 20:
                            severity = "LOW"
                            
                        if severity:
                            # Check if an active alert already exists for this region/disease
                            existing = self.db.query(AlertLog).filter(
                                AlertLog.region == region,
                                AlertLog.disease == disease,
                                AlertLog.severity == severity,
                                AlertLog.is_active == True
                            ).first()
                            
                            if not existing:
                                self.notifier.trigger_notification_workflow(region, disease, severity)
                                
                    except Exception as e:
                        print(f"[WARN] Alert engine error for {disease}/{region}: {str(e)}")
                        
        print("[ALERT_ENGINE] Alert scan complete.")

    def get_active_alerts(self, severity_filter=None):
        query = self.db.query(AlertLog).filter(AlertLog.is_active == True)
        if severity_filter:
            query = query.filter(AlertLog.severity == severity_filter)
        return query.order_by(AlertLog.timestamp.desc()).all()

    def resolve_alert(self, alert_id: int):
        alert = self.db.query(AlertLog).filter(AlertLog.id == alert_id).first()
        if alert:
            alert.is_active = False
            self.db.commit()
            return True
        return False
