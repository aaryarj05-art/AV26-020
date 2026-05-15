import os
import httpx
from fastapi import APIRouter, Body

router = APIRouter(
    prefix="/api/fusion",
    tags=["fusion"]
)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:8081")

@router.get("/status")
async def get_fusion_status(region: str = "Maharashtra"):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(f"{ML_SERVICE_URL}/api/fusion/status", params={"region": region})
            return res.json()
    except Exception as e:
        return {"error": "ML Service Unreachable", "detail": str(e)}

@router.get("/contribution")
async def get_fusion_contribution(disease: str, region: str):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(f"{ML_SERVICE_URL}/api/fusion/contribution", params={"disease": disease, "region": region})
            return res.json()
    except Exception as e:
        return {"error": "ML Service Unreachable", "detail": str(e)}

@router.post("/predict")
async def fusion_predict(request: dict = Body(...)):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(f"{ML_SERVICE_URL}/api/fusion/predict", json=request)
            return res.json()
    except Exception as e:
        return {"error": "ML Service Unreachable", "detail": str(e)}
