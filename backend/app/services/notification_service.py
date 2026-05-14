import os
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.models import AlertLog

NOTIFICATION_LOG = "notifications_log.txt"

class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def format_alert_message(self, severity, region, disease):
        actions = {
            "CRITICAL": "Activate Emergency Response Protocol. Notify District Health Officer immediately.",
            "HIGH": "Issue public health advisory. Increase surveillance in affected area.",
            "MEDIUM": "Monitor situation closely. Prepare resource inventory.",
            "LOW": "Continue passive surveillance."
        }
        
        action = actions.get(severity, "Monitor situation.")
        return f"[{severity}] Helix Alert: {disease} outbreak detected in {region}. Action: {action}"

    def send_in_app(self, region, disease, severity, message):
        alert = AlertLog(
            region=region,
            disease=disease,
            severity=severity,
            message=message,
            is_active=True,
            timestamp=datetime.utcnow()
        )
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert

    def send_email_mock(self, alert_id, region, disease, severity, message):
        log_entry = f"[{datetime.utcnow()}] EMAIL SENT TO dho@{region.lower()}.gov.in | Alert ID: {alert_id} | {message}\n"
        print(f"📧 Mock Email sent for Alert {alert_id}")
        
        with open(NOTIFICATION_LOG, "a") as f:
            f.write(log_entry)

    def trigger_notification_workflow(self, region, disease, severity):
        message = self.format_alert_message(severity, region, disease)
        alert = self.send_in_app(region, disease, severity, message)
        
        # Mock external delivery for high severity
        if severity in ["CRITICAL", "HIGH"]:
            self.send_email_mock(alert.id, region, disease, severity, message)
            
        return alert
