"""
Helix ML Service — FastAPI Application
Machine Learning models for disease prediction, outbreak forecasting, and health analytics
"""

import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from fastapi import FastAPI, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import httpx

from services.prediction_service import PredictionService
from services.arima_model import ARIMAForecast
from services.prophet_model import ProphetForecast
from services.lstm_model import LSTMForecast
from services.weather_service import WeatherService
from services.correlation_engine import CorrelationEngine
from services.symptom_clustering import SymptomClusteringEngine
from services.explainability_service import ExplainabilityService
from services.seir_simulation import SEIRSimulation
from services.resource_planner import ResourcePlanner
from services.fusion_engine import DataFusionEngine
from services.cluster_symptoms import SymptomClusteringService

app = FastAPI(
    title="Helix ML Service",
    description="Machine Learning service for predictive biomedical analytics",
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

service = PredictionService()
weather_service = WeatherService()
correlation_engine = CorrelationEngine()
clustering_engine = SymptomClusteringEngine()
explain_service = ExplainabilityService()
simulation_engine = SEIRSimulation()
resource_planner = ResourcePlanner()
fusion_engine = DataFusionEngine()
cluster_service = SymptomClusteringService()

# Thread pool for CPU-bound ML inference
_executor = ThreadPoolExecutor(max_workers=4)

# Region to City mapping
REGION_CITY_MAP = {
    "USA": "New York",
    "UK": "London",
    "Japan": "Tokyo",
    "Brazil": "Sao Paulo",
    "SA": "Johannesburg",
    "Nigeria": "Lagos",
    "Indonesia": "Jakarta",
    "Australia": "Sydney",
    "Egypt": "Cairo",
    "India": "Mumbai",
    "Unknown": "New York"
}


class PredictionRequest(BaseModel):
    disease: str
    region: str
    model: str = "ensemble" # arima, prophet, lstm, ensemble
    steps: int = 12

class SimulationRequest(BaseModel):
    disease: Optional[str] = "Dengue"
    population: int
    R0: float
    gamma: float
    days: int = 180
    model: str = "SEIR"
    interventions: Optional[List[Dict]] = []

class ResourcePlanRequest(BaseModel):
    disease: str
    region: str
    predicted_cases: int
    days: int = 14

class SymptomClassifyRequest(BaseModel):
    symptoms: List[str]

class ExplainRequest(BaseModel):
    disease: Optional[str] = None
    region: Optional[str] = None
    prediction_value: Optional[float] = 0.0

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "helix-ml"}

@app.post("/api/predict/outbreak")
async def predict_outbreak(request: PredictionRequest):
    loop = asyncio.get_event_loop()

    def _run():
        if request.model == "arima":
            model = ARIMAForecast(request.disease, request.region)
            try: return model.predict(steps=request.steps)
            except:
                model.fit()
                return model.predict(steps=request.steps)
        elif request.model == "prophet":
            model = ProphetForecast(request.disease, request.region)
            try: return model.predict(periods=request.steps)
            except:
                model.fit()
                return model.predict(periods=request.steps)
        elif request.model == "lstm":
            model = LSTMForecast(request.disease, request.region)
            try: return model.predict(steps=request.steps)
            except:
                model.fit()
                return model.predict(steps=request.steps)
        else:  # ensemble
            return service.run_ensemble(request.disease, request.region, steps=request.steps)

    return await loop.run_in_executor(_executor, _run)

@app.get("/api/predict/risk-score")
async def get_risk_score(disease: str, region: str):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, service.get_risk_score, disease, region)

@app.get("/api/environment/weather")
async def get_weather(city: Optional[str] = None, region: Optional[str] = None):
    target_city = city
    if not target_city and region: target_city = REGION_CITY_MAP.get(region, "Mumbai")
    if not target_city: target_city = "Mumbai"
    return weather_service.get_current(target_city)

@app.post("/api/symptoms/classify")
async def classify_symptoms(request: SymptomClassifyRequest):
    return clustering_engine.classify_disease(request.symptoms)

@app.post("/api/explain/outbreak")
async def explain_outbreak(request: ExplainRequest):
    return explain_service.explain_outbreak_prediction(request.disease, request.region, request.prediction_value)

@app.get("/api/predict/seasonal")
async def get_seasonal(disease: str):
    return service.get_seasonal_trends(disease)

@app.post("/api/simulation/seir")
async def run_simulation(req: SimulationRequest):
    return simulation_engine.run(
        N=req.population,
        R0=req.R0,
        gamma=req.gamma,
        days=req.days,
        model=req.model,
        interventions=req.interventions
    )

@app.post("/api/resources/plan")
async def get_resource_plan(req: ResourcePlanRequest):
    return resource_planner.calculate_resource_needs(req.disease, req.region, req.predicted_cases, req.days)

@app.get("/api/resources/gap-analysis")
async def get_gap_analysis(disease: str, region: str, predicted_cases: int):
    return resource_planner.gap_analysis(region, disease, predicted_cases)

# --- PHASE 23: DATA FUSION ENDPOINTS ---

@app.get("/api/fusion/status")
async def get_fusion_status(region: str = "Maharashtra"):
    return fusion_engine.get_status(region)

@app.get("/api/fusion/contribution")
async def get_fusion_contribution(disease: str, region: str):
    return fusion_engine.get_source_contributions(disease, region)

@app.post("/api/fusion/predict")
async def fusion_predict(request: dict = Body(...)):
    # request should contain disease, region, date
    return fusion_engine.fuse(request.get("disease"), request.get("region"), request.get("date"))


# --- PHASE 24: SYMPTOM CLUSTER DETECTION ---

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8080")

@app.get("/api/cluster/summary")
async def get_cluster_summary():
    """
    Fetch latest symptom reports and WHO data from the backend,
    run KMeans clustering, and return cluster + spike summaries.
    """
    import json
    from collections import defaultdict

    reports = []
    who_outbreaks = []

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            r = await client.get(f"{BACKEND_URL}/api/symptoms/summary")
            raw_summary = r.json()
            # Convert summary records into pseudo-report dicts for clustering
            for item in raw_summary:
                for _ in range(min(item.get("count", 1), 5)):
                    reports.append({
                        "region": item.get("region", "Unknown"),
                        "symptoms": [item.get("symptom_type", "Fever")],
                    })
        except Exception:
            pass

        try:
            w = await client.get(f"{BACKEND_URL}/api/who/live-outbreaks")
            who_outbreaks = w.json().get("outbreaks", [])
        except Exception:
            pass

    # If no real reports, seed with representative mock data for demo
    if not reports:
        mock_symptoms = [
            ["Fever", "Joint Pain", "Rash"],
            ["Fever", "Chills", "Headache"],
            ["Diarrhea", "Vomiting"],
            ["Cough", "Fatigue"],
            ["Fever", "Cough", "Shortness of Breath"],
        ]
        for i, syms in enumerate(mock_symptoms * 3):
            reports.append({"region": ["New York, USA", "London, UK", "Tokyo, Japan", "Sao Paulo, Brazil", "Johannesburg, SA"][i % 5], "symptoms": syms})

    clusters = cluster_service.get_cluster_summary(reports, who_outbreaks)

    # Spike detection: build region → date → count from reports
    region_daily: dict = defaultdict(lambda: defaultdict(int))
    from datetime import datetime as _dt
    today_str = _dt.utcnow().strftime("%Y-%m-%d")
    for r in reports:
        region_daily[r.get("region", "Unknown")][today_str] += 1

    spikes = cluster_service.detect_spikes({k: dict(v) for k, v in region_daily.items()})

    return {"clusters": clusters, "spikes": [s for s in spikes if s["is_spike"]]}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
