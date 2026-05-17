"""
Helix Backend — FastAPI Application
Predictive Biomedical & Public Health Intelligence Platform
"""

import os
import asyncio
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
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
from app.services.realtime_service import connection_manager, realtime_service
from app.database import SessionLocal

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: start background tasks on startup, clean up on shutdown."""
    # Start background alert scanner
    alert_task = asyncio.create_task(run_alert_scanner())
    # Start realtime WebSocket broadcast service
    realtime_task = asyncio.create_task(realtime_service.start())
    yield
    # Shutdown
    realtime_service.stop()
    alert_task.cancel()
    realtime_task.cancel()


app = FastAPI(
    title="Helix Backend",
    description="Predictive Biomedical & Public Health Intelligence Platform — Core API",
    version="0.1.0",
    lifespan=lifespan,
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


@app.websocket("/ws/realtime")
async def websocket_realtime(websocket: WebSocket):
    """WebSocket endpoint for realtime data streaming."""
    await connection_manager.connect(websocket)
    try:
        # Send initial data snapshot on connect
        import json
        from datetime import datetime
        from app.services.who_service import get_cached

        now = datetime.utcnow().isoformat()
        try:
            who_cache = await get_cached()
            outbreaks = who_cache.get("data", [])
        except Exception:
            outbreaks = []

        # Send initial WHO data
        await websocket.send_text(json.dumps({
            "type": "who_outbreaks",
            "payload": {"outbreaks": outbreaks, "count": len(outbreaks)},
            "timestamp": now,
            "source": "who_service",
        }))

        # Send initial heatmap points
        heatmap_points = realtime_service._generate_heatmap_points(outbreaks)
        await websocket.send_text(json.dumps({
            "type": "heatmap_points",
            "payload": {"points": heatmap_points},
            "timestamp": now,
            "source": "heatmap_aggregator",
        }))

        # Keep connection alive
        while True:
            # Wait for client messages (ping/pong keep-alive)
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
    except Exception:
        connection_manager.disconnect(websocket)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "helix-backend"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
