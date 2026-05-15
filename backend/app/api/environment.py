import os
import httpx
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter(
    prefix="/api/environment",
    tags=["environment"]
)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:8081")

@router.get("/weather")
async def get_weather(city: Optional[str] = None, region: Optional[str] = None):
    try:
        async with httpx.AsyncClient() as client:
            params = {}
            if city: params["city"] = city
            if region: params["region"] = region
            
            response = await client.get(
                f"{ML_SERVICE_URL}/api/environment/weather",
                params=params,
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")

@router.get("/correlations")
async def get_correlations(disease: str, region: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ML_SERVICE_URL}/api/environment/correlations",
                params={"disease": disease, "region": region},
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")

@router.get("/risk-multiplier")
async def get_risk_multiplier(disease: str, region: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ML_SERVICE_URL}/api/environment/risk-multiplier",
                params={"disease": disease, "region": region},
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")
