import httpx
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional

router = APIRouter(prefix="/api/learning", tags=["learning"])

ML_SERVICE_URL = "http://localhost:8001/api/learning"

@router.get("/status")
async def get_status():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{ML_SERVICE_URL}/status")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/trigger-retrain/{model_name}")
async def trigger_retrain(model_name: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{ML_SERVICE_URL}/trigger-retrain/{model_name}")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance-log")
async def get_performance_log(model: Optional[str] = None):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{ML_SERVICE_URL}/performance-log", params={"model": model})
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/improvements")
async def get_improvements():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{ML_SERVICE_URL}/improvements")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
