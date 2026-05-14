"""
Helix Backend — FastAPI Application
Predictive Biomedical & Public Health Intelligence Platform
"""

import os
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.data import router as data_router
from app.api.predictions import router as predictions_router
from app.api.environment import router as environment_router
from app.api.symptoms import router as symptoms_router
from app.api.dashboard import router as dashboard_router
from app.api.alerts import router as alerts_router
from app.api.personal import router as personal_router
from app.api.wearables import router as wearables_router
from app.api.explain import router as explain_router
from app.api.metrics import router as metrics_router
from app.api.fusion import router as fusion_router
from app.api.strokeguard import router as strokeguard_router
from app.api.map import router as map_router
from app.api.demo import router as demo_router
from app.api.kpi import router as kpi_router
from app.api.operations import router as operations_router
from app.api.impact import router as impact_router
from app.api.simulation import router as simulation_router
from app.api.resources import router as resources_router
from app.api.reports import router as reports_router
from app.api.teleconsult import router as teleconsult_router
from app.api.diet import router as diet_router
from app.api.mental_health import router as mental_health_router
from app.api.passport import router as passport_router
from app.api.learning import router as learning_router
from app.api.insurance import router as insurance_router
from app.api.hospital import router as hospital_router
from app.api.drug_discovery import router as drug_discovery_router

from app.services.alert_engine import AlertEngine
from app.database import SessionLocal

load_dotenv()

app = FastAPI(
    title="Helix Backend",
    description="Predictive Biomedical & Public Health Intelligence Platform — Core API",
    version="0.1.0",
)

# CORS — allow all origins for hackathon development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_router)
app.include_router(predictions_router)
app.include_router(environment_router)
app.include_router(symptoms_router)
app.include_router(dashboard_router)
app.include_router(alerts_router)
app.include_router(personal_router)
app.include_router(wearables_router)
app.include_router(explain_router)
app.include_router(metrics_router)
app.include_router(fusion_router)
app.include_router(strokeguard_router)
app.include_router(map_router)
app.include_router(demo_router)
app.include_router(kpi_router)
app.include_router(operations_router)
app.include_router(impact_router)
app.include_router(simulation_router)
app.include_router(resources_router)
app.include_router(reports_router)
app.include_router(teleconsult_router)
app.include_router(diet_router)
app.include_router(mental_health_router)
app.include_router(passport_router)
app.include_router(learning_router)
app.include_router(insurance_router)
app.include_router(hospital_router)
app.include_router(drug_discovery_router)

# Background Monitoring Task
async def run_alert_scanner():
    while True:
        try:
            db = SessionLocal()
            engine = AlertEngine(db)
            await engine.check_all_regions()
            db.close()
        except Exception as e:
            print(f"[ERR] Background Monitor Error: {e}")
        
        await asyncio.sleep(300) # Run every 5 minutes

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(run_alert_scanner())

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "helix-backend"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
