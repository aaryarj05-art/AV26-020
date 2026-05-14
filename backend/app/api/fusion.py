import os
import httpx
from fastapi import APIRouter, Body

router = APIRouter(
    prefix="/api/fusion",
    tags=["fusion"]
)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:8001")

@router.get("/status")
async def get_fusion_status(region: str = "Maharashtra"):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{ML_SERVICE_URL}/api/fusion/status", params={"region": region})
            return res.json()
        except:
            return {"error": "ML Service Unreachable"}

@router.get("/contribution")
async def get_fusion_contribution(disease: str, region: str):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{ML_SERVICE_URL}/api/fusion/contribution", params={"disease": disease, "region": region})
            return res.json()
        except:
            return {"error": "ML Service Unreachable"}

@router.post("/predict")
async def fusion_predict(request: dict = Body(...)):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(f"{ML_SERVICE_URL}/api/fusion/predict", json=request)
            return res.json()
        except:
            return {"error": "ML Service Unreachable"}
