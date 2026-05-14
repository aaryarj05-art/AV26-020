import httpx
from fastapi import APIRouter, HTTPException
from typing import Dict

router = APIRouter(prefix="/api/drug-discovery", tags=["drug-discovery"])

ML_SERVICE_URL = "http://localhost:8001/api/drug-discovery"

@router.post("/simulate")
async def simulate_protocol(disease: str, protocol: Dict):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{ML_SERVICE_URL}/simulate",
                json={"disease": disease, "protocol": protocol}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
