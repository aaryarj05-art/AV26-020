import httpx
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict

router = APIRouter(prefix="/api/diet", tags=["diet"])

ML_SERVICE_URL = "http://localhost:8001/api/diet"

@router.post("/generate-plan")
async def generate_plan(risk_profile: Dict, preferences: Optional[Dict] = None):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{ML_SERVICE_URL}/generate-plan",
                json={"risk_profile": risk_profile, "preferences": preferences}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/meals")
async def get_meals(category: Optional[str] = None, disease: Optional[str] = None, max_calories: Optional[int] = None):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{ML_SERVICE_URL}/meals",
                params={"category": category, "disease": disease, "max_calories": max_calories}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/score-meal")
async def score_meal(meal_name: str, risk_profile: Dict):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{ML_SERVICE_URL}/score-meal",
                json={"meal_name": meal_name, "risk_profile": risk_profile}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/supplements")
async def get_supplements(risk_profile: str = Query(...)):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{ML_SERVICE_URL}/supplements",
                params={"risk_profile": risk_profile}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
