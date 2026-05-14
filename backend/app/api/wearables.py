from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from ..database import get_db
from ..models.models import WearableReading
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/wearables",
    tags=["wearables"]
)

class WearableIngest(BaseModel):
    device_id: str
    heart_rate: int
    spo2: float
    steps: int
    sleep_hours: float

@router.post("/ingest")
async def ingest_wearable_data(data: WearableIngest, db: Session = Depends(get_db)):
    reading = WearableReading(
        device_id=data.device_id,
        heart_rate=data.heart_rate,
        spo2=data.spo2,
        steps=data.steps,
        sleep_hours=data.sleep_hours,
        timestamp=datetime.utcnow()
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return {"status": "success", "id": reading.id}

@router.get("/latest")
async def get_latest_reading(db: Session = Depends(get_db)):
    reading = db.query(WearableReading).order_by(WearableReading.timestamp.desc()).first()
    if not reading:
        # Return mock if no real data yet
        return {
            "heart_rate": 72,
            "spo2": 98.5,
            "steps": 4500,
            "sleep_hours": 7.2,
            "timestamp": datetime.utcnow().isoformat()
        }
    return reading

@router.get("/trends")
async def get_wearable_trends(db: Session = Depends(get_db)):
    # Last 24 hours
    since = datetime.utcnow() - timedelta(hours=24)
    readings = db.query(WearableReading).filter(WearableReading.timestamp >= since).order_by(WearableReading.timestamp.asc()).all()
    
    if not readings:
        return []
        
    return readings
