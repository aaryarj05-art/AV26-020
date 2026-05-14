"""
Helix ML Service — FastAPI Application
Machine Learning models for disease prediction, outbreak forecasting, and health analytics
"""

import os
from fastapi import FastAPI, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from services.prediction_service import PredictionService
from services.arima_model import ARIMAForecast
from services.prophet_model import ProphetForecast
from services.lstm_model import LSTMForecast
from services.weather_service import WeatherService
from services.correlation_engine import CorrelationEngine
from services.symptom_clustering import SymptomClusteringEngine

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

@app.get("/api/symptoms/clusters")
async def get_symptom_clusters(region: str):
    # This would normally query the DB via Backend, but for ML we mock it or expect data
    # Placeholder: return empty list or mock clusters
    return clustering_engine.detect_clusters(region, [])

@app.get("/api/symptoms/spikes")
async def get_symptom_spikes(region: str, symptom: str):
    # Placeholder: mock spike detection
    return clustering_engine.detect_spike([10, 12, 15, 11, 13, 14, 12], 25) # Example spike

@app.get("/api/predict/seasonal")
async def get_seasonal(disease: str):
    return service.get_seasonal_trends(disease)

@app.get("/api/models/status")
async def get_models_status():
    return service.get_models_status()

@app.get("/api/models/metrics")
async def get_models_metrics():
    return service.get_all_metrics()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
