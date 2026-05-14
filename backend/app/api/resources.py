import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/resources",
    tags=["resources"]
)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8001")

class ResourcePlanRequest(BaseModel):
    disease: str
    region: str
    predicted_cases: int
    days: int = 14

@router.post("/plan")
async def get_resource_plan(req: ResourcePlanRequest):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{ML_SERVICE_URL}/api/resources/plan",
                json=req.dict(),
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")

@router.get("/current-inventory")
async def get_inventory(region: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ML_SERVICE_URL}/api/resources/current-inventory",
                params={"region": region},
                timeout=5.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")

@router.get("/gap-analysis")
async def get_gap_analysis(disease: str, region: str, predicted_cases: int):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ML_SERVICE_URL}/api/resources/gap-analysis",
                params={"disease": disease, "region": region, "predicted_cases": predicted_cases},
                timeout=5.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")

@router.get("/full-report")
async def get_full_report(disease: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ML_SERVICE_URL}/api/resources/full-report",
                params={"disease": disease},
                timeout=15.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")
