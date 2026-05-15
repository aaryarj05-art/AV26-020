from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.models import AlertLog
from ..services.alert_engine import AlertEngine

router = APIRouter(
    prefix="/api/alerts",
    tags=["alerts"]
)

@router.get("/active")
async def get_active_alerts(
    severity: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    engine = AlertEngine(db)
    return engine.get_active_alerts(severity)

@router.get("/history")
async def get_alert_history(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db)
):
    return db.query(AlertLog).order_by(AlertLog.timestamp.desc()).offset(skip).limit(limit).all()

@router.post("/resolve/{alert_id}")
async def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    engine = AlertEngine(db)
    if engine.resolve_alert(alert_id):
        return {"status": "success", "message": f"Alert {alert_id} resolved"}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/test")
async def trigger_test_alert(
    region: str = "New York, USA", 
    disease: str = "Dengue", 
    severity: str = "HIGH",
    db: Session = Depends(get_db)
):
    new_alert = AlertLog(
        region=region,
        disease=disease,
        severity=severity,
        message=f"TEST ALERT: {severity} risk for {disease} in {region}.",
        is_active=True
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return {"status": "success", "alert": new_alert}

@router.get("/notifications")
async def poll_notifications(db: Session = Depends(get_db)):
    # Returns last 5 active alerts for the bell dropdown
    return db.query(AlertLog).filter(AlertLog.is_active == True).order_by(AlertLog.timestamp.desc()).limit(5).all()
