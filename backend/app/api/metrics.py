import os
import httpx
from fastapi import APIRouter

router = APIRouter(
    prefix="/api/models/metrics",
    tags=["metrics"]
)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:8001")

@router.get("")
async def get_all_metrics():
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{ML_SERVICE_URL}/api/models/metrics")
            return res.json()
        except:
            return {"error": "ML Service Unreachable"}

@router.get("/roc")
async def get_roc_curves():
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{ML_SERVICE_URL}/api/models/metrics/roc")
            return res.json()
        except:
            return {"error": "ML Service Unreachable"}

@router.get("/scatter")
async def get_scatter_data(disease: str, region: str):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{ML_SERVICE_URL}/api/models/metrics/scatter", params={"disease": disease, "region": region})
            return res.json()
        except:
            return {"error": "ML Service Unreachable"}

@router.get("/confusion")
async def get_confusion_matrix():
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{ML_SERVICE_URL}/api/models/metrics/confusion")
            return res.json()
        except:
            return {"error": "ML Service Unreachable"}
