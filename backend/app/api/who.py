"""
backend/app/api/who.py

Routes:
  GET /api/who/live-outbreaks       — cached WHO data (15-min TTL)
  GET /api/who/cluster-summary      — proxies to ML service /api/cluster/summary
  GET /api/who/disease-types        — unique disease names from WHO feed (5-min cache)
  GET /api/who/outbreaks-by-disease — filtered outbreaks by disease name
"""

import os
import httpx
from fastapi import APIRouter, Query

from ..services.who_service import get_cached, get_disease_types, get_outbreaks_by_disease

router = APIRouter(prefix="/api/who", tags=["who"])

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:8081")


@router.get("/live-outbreaks")
async def live_outbreaks():
    cache = await get_cached()
    return {
        "outbreaks": cache["data"],
        "source": "WHO",
        "cached_at": cache["fetched_at"].isoformat() if cache["fetched_at"] else None,
        "count": len(cache["data"]),
    }


@router.get("/disease-types")
async def disease_types():
    """Returns all unique disease names extracted from the WHO IHR feed."""
    result = await get_disease_types()
    return {
        "diseases": result["diseases"],
        "lastUpdated": result["fetched_at"].isoformat() if result["fetched_at"] else None,
    }


@router.get("/outbreaks-by-disease")
async def outbreaks_by_disease(disease: str = Query("", description="Disease name to filter by")):
    """Returns WHO outbreaks filtered by disease name."""
    outbreaks = await get_outbreaks_by_disease(disease)
    return {
        "disease": disease,
        "outbreaks": outbreaks,
        "count": len(outbreaks),
    }


@router.get("/cluster-summary")
async def cluster_summary():
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(f"{ML_SERVICE_URL}/api/cluster/summary")
            return resp.json()
    except Exception as e:
        return {"error": "ML cluster service unreachable", "detail": str(e), "clusters": [], "spikes": []}
