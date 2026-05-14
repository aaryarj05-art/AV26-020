"""
Helix ML Service — FastAPI Application
Machine Learning models for disease prediction, outbreak forecasting, and health analytics
"""

import os
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
from services.personal_risk_service import PersonalRiskService
from services.health_twin import HealthTwin
from services.stroke_guard import StrokeGuardEngine
from services.explainability_service import ExplainabilityService
from services.metrics_service import MetricsService
from services.fusion_engine import DataFusionEngine

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
personal_risk_service = PersonalRiskService()
stroke_guard_engine = StrokeGuardEngine()
explain_service = ExplainabilityService()
metrics_service = MetricsService()
fusion_engine = DataFusionEngine()

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

class SymptomClassifyRequest(BaseModel):
    symptoms: List[str]

class HealthProfileRequest(BaseModel):
    profile: Dict

class HealthTwinSimulationRequest(BaseModel):
    profile: Dict
    years: int = 5
    interventions: Optional[Dict] = None

class StrokeGuardRequest(BaseModel):
    health_data: Dict

class ExplainRequest(BaseModel):
    disease: Optional[str] = None
    region: Optional[str] = None
    condition: Optional[str] = None
    user_data: Optional[Dict] = None
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

# Phase 5 Environment Endpoints
@app.get("/api/environment/weather")
async def get_weather(city: Optional[str] = None, region: Optional[str] = None):
    target_city = city
    if not target_city and region: target_city = REGION_CITY_MAP.get(region, "Mumbai")
    if not target_city: target_city = "Mumbai"
    return weather_service.get_current(target_city)

@app.get("/api/environment/correlations")
async def get_correlations(disease: str, region: str):
    return correlation_engine.compute_correlations(disease, region)

@app.get("/api/environment/risk-multiplier")
async def get_risk_multiplier(disease: str, region: str):
    city = REGION_CITY_MAP.get(region, "Mumbai")
    weather = weather_service.get_current(city)
    return correlation_engine.get_risk_multiplier(weather, disease)

# Phase 6 Symptom Endpoints
@app.post("/api/symptoms/classify")
async def classify_symptoms(request: SymptomClassifyRequest):
    return clustering_engine.classify_disease(request.symptoms)

# Phase 9 Personal Risk Endpoints
@app.post("/api/personal/risk-assessment")
async def get_personal_risk(request: HealthProfileRequest):
    return personal_risk_service.predict_all(request.profile)

@app.post("/api/personal/disease-risk")
async def get_single_risk(condition: str, health_data: Dict):
    if condition == 'diabetes': return personal_risk_service.predict_diabetes(health_data)
    elif condition == 'heart': return personal_risk_service.predict_heart(health_data)
    elif condition == 'stroke': return personal_risk_service.predict_stroke(health_data)
    return {"error": "Invalid condition"}

# Phase 10 Health Twin & Stroke Guard Endpoints
@app.post("/api/personal/health-twin/simulate")
async def simulate_health_twin(request: HealthTwinSimulationRequest):
    twin = HealthTwin(request.profile)
    return twin.run_simulation(years=request.years, interventions=request.interventions)

@app.post("/api/personal/health-twin/reduction")
async def get_risk_reduction(profile: Dict, intervention: str, value: float):
    twin = HealthTwin(profile)
    return {"reduction": twin.get_potential_reduction(intervention, value)}

@app.post("/api/personal/stroke-guard")
async def run_stroke_guard(request: StrokeGuardRequest):
    base_risk = personal_risk_service.predict_stroke(request.health_data)
    return stroke_guard_engine.assess_neurological_risk(request.health_data, base_risk)

# Phase 11 Explainability Endpoints
@app.post("/api/explain/outbreak")
async def explain_outbreak(request: ExplainRequest):
    return explain_service.explain_outbreak_prediction(request.disease, request.region, request.prediction_value)

@app.post("/api/explain/personal-risk")
async def explain_personal(request: ExplainRequest):
    return explain_service.explain_personal_risk(request.condition, request.user_data)

@app.post("/api/explain/alert")
async def explain_alert(alert_data: Dict):
    return explain_service.explain_alert(alert_data)

@app.get("/api/predict/seasonal")
async def get_seasonal(disease: str):
    return service.get_seasonal_trends(disease)

@app.get("/api/models/status")
async def get_models_status():
    return service.get_models_status()

@app.get("/api/models/metrics")
async def get_models_metrics():
    return metrics_service.generate_metrics_report()

@app.get("/api/models/metrics/roc")
async def get_roc_curves():
    return metrics_service.get_roc_curves()

@app.get("/api/models/metrics/scatter")
async def get_scatter_data(disease: str, region: str):
    return metrics_service.get_scatter_data(disease, region)

@app.get("/api/models/metrics/confusion")
async def get_confusion_matrix():
    return metrics_service.get_confusion_matrix()

# Phase 13 Data Fusion Endpoints
@app.get("/api/fusion/status")
async def get_fusion_status(region: str = "Maharashtra"):
    return fusion_engine.get_status(region)

@app.get("/api/fusion/contribution")
async def get_fusion_contribution(disease: str, region: str):
    return fusion_engine.get_source_contributions(disease, region)

@app.post("/api/fusion/predict")
async def fusion_predict(request: PredictionRequest):
    return fusion_engine.fuse(request.disease, request.region, datetime.now().isoformat())

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
