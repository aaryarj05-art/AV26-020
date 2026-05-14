import httpx
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Optional

router = APIRouter(prefix="/api/insurance", tags=["insurance"])

ML_SERVICE_URL = "http://localhost:8001/api/insurance"

@router.post("/premium")
async def calculate_premium(user_profile: Dict, region_risk_score: float):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{ML_SERVICE_URL}/premium",
                json={"user_profile": user_profile, "region_risk_score": region_risk_score}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/portfolio-risk")
async def get_portfolio_risk(region: str, disease_risk_avg: float = Query(...)):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{ML_SERVICE_URL}/portfolio-risk",
                params={"region": region, "disease_risk_avg": disease_risk_avg}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
