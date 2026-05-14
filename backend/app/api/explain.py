import os
import httpx
from fastapi import APIRouter, Body, HTTPException
from typing import Dict, Optional

router = APIRouter(
    prefix="/api/explain",
    tags=["explainability"]
)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:8001")

@router.post("/outbreak")
async def explain_outbreak(data: Dict = Body(...)):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(f"{ML_SERVICE_URL}/api/explain/outbreak", json=data)
            return res.json()
        except:
            return {"error": "ML Service Unreachable"}

@router.post("/personal-risk")
async def explain_personal(data: Dict = Body(...)):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(f"{ML_SERVICE_URL}/api/explain/personal-risk", json=data)
            return res.json()
        except:
            return {"error": "ML Service Unreachable"}

@router.get("/alert/{alert_id}")
async def explain_alert(alert_id: int):
    # In a real app, we'd fetch alert data from DB first
    # For demo, we mock alert data to explain
    mock_alert = {
        "risk_score": 88,
        "case_count": 620,
        "spike_zscore": 3.4
    }
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(f"{ML_SERVICE_URL}/api/explain/alert", json=mock_alert)
            return res.json()
        except:
            return {"error": "ML Service Unreachable"}
