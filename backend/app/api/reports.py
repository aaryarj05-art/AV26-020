from fastapi import APIRouter, Response, Query
from app.services.report_generator import ReportGenerator
from typing import List

router = APIRouter(
    prefix="/api/reports",
    tags=["reports"]
)

generator = ReportGenerator()

@router.get("/regional")
async def get_regional_report(
    region: str = Query(...),
    disease: str = Query(...)
):
    """Generates and streams a regional health briefing PDF."""
    pdf_bytes = generator.generate_regional_brief(region, disease)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="Helix_Briefing_{region}_{disease}.pdf"'
        }
    )

@router.get("/national")
async def get_national_report():
    """Generates and streams a national summary PDF."""
    pdf_bytes = generator.generate_national_summary()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="Helix_National_Summary.pdf"'
        }
    )

@router.get("/alert/{alert_id}")
async def get_alert_report(alert_id: str):
    """Generates and streams an alert-specific emergency brief PDF."""
    pdf_bytes = generator.generate_alert_brief(alert_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="Helix_Alert_Brief_{alert_id}.pdf"'
        }
    )

@router.get("/list")
async def list_recent_reports():
    """Returns a list of recently simulated reports for the UI."""
    return generator.list_recent()
