from fastapi import APIRouter, HTTPException, Query
from app.services.hospital_signals import HospitalSignalService
from typing import List, Optional

router = APIRouter(prefix="/api/hospital", tags=["hospital"])

@router.get("/occupancy")
async def get_occupancy(region: str):
    return HospitalSignalService.generate_bed_occupancy(region)

@router.get("/er-volume")
async def get_er_volume(region: str, days: int = 30):
    return HospitalSignalService.generate_er_volume(region, days)

@router.get("/network")
async def get_network(city: str):
    return HospitalSignalService.get_hospital_network(city)
