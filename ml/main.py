"""
Helix ML Service — FastAPI Application
Machine Learning models for disease prediction, outbreak forecasting, and health analytics
"""

import os
from datetime import datetime
from fastapi import FastAPI, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict

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
from services.fusion_service import FusionService

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
fusion_service = FusionService()

# Region to City mapping
REGION_CITY_MAP = {
    "Maharashtra": "Mumbai",
    "Delhi": "Delhi",
    "Karnataka": "Bangalore",
    "Tamil Nadu": "Chennai",
    "Kerala": "Kochi"
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
    else: # ensemble
        return service.run_ensemble(request.disease, request.region, steps=request.steps)

@app.get("/api/predict/risk-score")
async def get_risk_score(disease: str, region: str):
    return service.get_risk_score(disease, region)

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
    return fusion_service.get_status(region)

@app.get("/api/fusion/contribution")
async def get_fusion_contribution(disease: str, region: str):
    return fusion_service.get_contribution(disease, region)

@app.post("/api/fusion/predict")
async def fusion_predict(request: dict = Body(...)):
    return fusion_service.fusion_predict(request)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
