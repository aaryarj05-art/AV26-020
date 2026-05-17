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
from app.api.explain import router as explain_router
from app.api.map import router as map_router
from app.api.simulation import router as simulation_router
from app.api.resources import router as resources_router
from app.api.reports import router as reports_router
from app.api.fusion import router as fusion_router
from app.api.who import router as who_router
from app.api.kpi import router as kpi_router

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
app.include_router(explain_router)
app.include_router(map_router)
app.include_router(simulation_router)
app.include_router(resources_router)
app.include_router(reports_router)
app.include_router(fusion_router)
app.include_router(who_router)
app.include_router(kpi_router)

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
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
