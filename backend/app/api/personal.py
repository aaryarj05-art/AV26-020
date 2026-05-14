import os
import httpx
from fastapi import APIRouter, Body
from typing import Dict

router = APIRouter(
    prefix="/api/personal",
    tags=["personal"]
)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8001")

@router.post("/risk-assessment")
async def get_personal_risk(profile: Dict = Body(...)):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                f"{ML_SERVICE_URL}/api/personal/risk-assessment",
                json={"profile": profile},
                timeout=10.0
            )
            return res.json()
        except Exception as e:
            # Fallback mock data if ML service unreachable
            return {
                "diabetes": {"risk_probability": 0.15, "risk_category": "Low"},
                "heart": {"risk_probability": 0.25, "risk_category": "Low", "top_risk_factors": []},
                "stroke": {"risk_probability": 0.12, "risk_category": "Low"}
            }

@router.post("/disease-risk")
async def get_single_risk(condition: str, health_data: Dict = Body(...)):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{ML_SERVICE_URL}/api/personal/disease-risk",
            params={"condition": condition},
            json=health_data,
            timeout=10.0
        )
        return res.json()
