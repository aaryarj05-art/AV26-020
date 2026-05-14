from fastapi import APIRouter
from ..services.impact_service import ImpactService

router = APIRouter(
    prefix="/api/impact",
    tags=["impact"]
)

@router.get("/summary")
async def get_impact_summary():
    return ImpactService.get_impact_summary()
