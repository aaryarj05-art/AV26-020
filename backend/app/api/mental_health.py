import httpx
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import MoodLog
from typing import List, Dict, Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/mental-health", tags=["mental-health"])

ML_SERVICE_URL = "http://localhost:8001/api/mental-health"

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/assess")
async def assess(responses: List[int], region_risk: float = 0, personal_risk: float = 0):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{ML_SERVICE_URL}/assess",
                json={"responses": responses},
                params={"region_risk": region_risk, "personal_risk": personal_risk}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/exercises")
async def get_exercises(max_duration: Optional[int] = None, stress_level: str = "Normal"):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{ML_SERVICE_URL}/exercises",
                params={"max_duration": max_duration, "stress_level": stress_level}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/mood-log")
async def log_mood(mood_score: int, stress_score: int, user_session_id: str, notes: str = None, db: Session = Depends(get_db)):
    log = MoodLog(
        user_session_id=user_session_id,
        mood_score=mood_score,
        stress_score=stress_score,
        notes=notes,
        date=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.get("/mood-trend")
async def get_trend(user_session_id: str, db: Session = Depends(get_db)):
    # Get last 14 days
    fourteen_days_ago = datetime.utcnow() - timedelta(days=14)
    logs = db.query(MoodLog).filter(
        MoodLog.user_session_id == user_session_id,
        MoodLog.date >= fourteen_days_ago
    ).order_by(MoodLog.date.asc()).all()
    
    if not logs:
        return {"trend": "Stable", "history": []}
        
    scores = [log.mood_score for log in logs]
    history_str = ",".join(map(str, scores))
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{ML_SERVICE_URL}/mood-trend",
                params={"history": history_str}
            )
            return {
                "trend": response.json()["trend"],
                "history": [{"date": log.date.strftime("%Y-%m-%d"), "score": log.mood_score} for log in logs]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/resources")
async def get_resources():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{ML_SERVICE_URL}/resources")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
