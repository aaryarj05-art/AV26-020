import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict

router = APIRouter(
    prefix="/api/simulation",
    tags=["simulation"]
)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:8081")

class SimulationRequest(BaseModel):
    disease: Optional[str] = "Dengue"
    population: int
    R0: float
    gamma: float
    days: int = 180
    model: str = "SEIR"
    interventions: Optional[List[Dict]] = []

@router.get("/presets")
async def get_presets():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ML_SERVICE_URL}/api/simulation/presets",
                timeout=5.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")

@router.post("/seir")
async def run_simulation(req: SimulationRequest):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{ML_SERVICE_URL}/api/simulation/seir",
                json=req.dict(),
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ML Service Error: {str(e)}")
