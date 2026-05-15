"""
backend/app/api/who.py

Routes:
  GET /api/who/live-outbreaks  — cached WHO data (15-min TTL)
  GET /api/who/cluster-summary — proxies to ML service /api/cluster/summary
"""

import os
import httpx
from fastapi import APIRouter

from ..services.who_service import get_cached

router = APIRouter(prefix="/api/who", tags=["who"])

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:8001")


@router.get("/live-outbreaks")
async def live_outbreaks():
    cache = await get_cached()
    return {
        "outbreaks": cache["data"],
        "source": "WHO",
        "cached_at": cache["fetched_at"].isoformat() if cache["fetched_at"] else None,
        "count": len(cache["data"]),
    }


@router.get("/cluster-summary")
async def cluster_summary():
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(f"{ML_SERVICE_URL}/api/cluster/summary")
            return resp.json()
    except Exception as e:
        return {"error": "ML cluster service unreachable", "detail": str(e), "clusters": [], "spikes": []}
