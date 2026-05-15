import os
import httpx
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter(
    prefix="/api/predictions",
    tags=["predictions"]
)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:8081")

# Map global UI cities to available ML dataset regions
REGION_MOCK_MAP = {
    "New York, USA": "Maharashtra",
    "London, UK": "Delhi",
    "Tokyo, Japan": "Karnataka",
    "Sao Paulo, Brazil": "Tamil Nadu",
    "Johannesburg, SA": "Kerala",
    "Lagos, Nigeria": "Maharashtra",
    "Jakarta, Indonesia": "Delhi",
    "Sydney, Australia": "Karnataka",
    "Cairo, Egypt": "Tamil Nadu",
    "Mumbai, India": "Maharashtra"
}

@router.get("/outbreak")
async def get_outbreak_prediction(
    disease: str,
    region: str,
    model: str = "ensemble",
    steps: int = 12
):
    target_region = REGION_MOCK_MAP.get(region, region)
    if target_region not in ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Kerala"]:
        target_region = "Maharashtra"
        
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{ML_SERVICE_URL}/api/predict/outbreak",
                json={
                    "disease": disease,
                    "region": target_region,
                    "model": model,
                    "steps": steps
                },
                timeout=90.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")

@router.get("/risk-score")
async def get_risk_score(disease: str, region: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ML_SERVICE_URL}/api/predict/risk-score",
                params={"disease": disease, "region": region},
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")

@router.get("/models/status")
async def get_models_status():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ML_SERVICE_URL}/api/models/status",
                timeout=5.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")
@router.get("/seasonal")
async def get_seasonal(disease: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ML_SERVICE_URL}/api/predict/seasonal",
                params={"disease": disease},
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")
