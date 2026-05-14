"""
Helix ML Service — FastAPI Application
Machine Learning models for disease prediction, outbreak forecasting, and health analytics
"""

import os
import os
from datetime import datetime
from fastapi import FastAPI, Body, Query, File, UploadFile, Form
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
from services.seir_simulation import SEIRSimulation
from services.resource_planner import ResourcePlanner
from services.diet_engine import DietEngine
from services.mental_health_engine import MentalHealthEngine
from services.model_monitor import ModelMonitor
from services.retrainer import Retrainer
from scheduler import LearningScheduler
from services.insurance_engine import InsuranceEngine
from services.drug_discovery import DrugDiscoveryEngine

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
simulation_engine = SEIRSimulation()
resource_planner = ResourcePlanner()
diet_engine = DietEngine()
mental_health_engine = MentalHealthEngine()
model_monitor = ModelMonitor()
retrainer = Retrainer(model_monitor)
scheduler = LearningScheduler(model_monitor, retrainer)
insurance_engine = InsuranceEngine()
drug_discovery_engine = DrugDiscoveryEngine()

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

class DietPlanRequest(BaseModel):
    risk_profile: Dict
    preferences: Optional[Dict] = None

class MealScoreRequest(BaseModel):
    meal_name: str
    risk_profile: Dict

class MentalHealthAssessRequest(BaseModel):
    responses: List[int]

class MoodLogRequest(BaseModel):
    user_session_id: str
    mood_score: int
    stress_score: int
    notes: Optional[str] = None

class InsurancePremiumRequest(BaseModel):
    user_profile: Dict
    region_risk_score: float

class DrugSimulationRequest(BaseModel):
    disease: str
    protocol: Dict

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "helix-ml"}

@app.on_event("startup")
async def startup_event():
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

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

# Phase 14 Stroke Guard Endpoints
@app.post("/api/personal/stroke-guard/facial")
async def analyze_facial(file: UploadFile = File(...)):
    image_bytes = await file.read()
    return stroke_guard_engine.facial_engine.analyze_image(image_bytes)

@app.post("/api/personal/stroke-guard/speech")
async def analyze_speech(text: str = Body(..., embed=True)):
    return stroke_guard_engine.speech_engine.analyze_text_input(text)

@app.post("/api/personal/stroke-guard/full")
async def stroke_guard_full(
    health_data: str = Form(...),
    stroke_model_risk: float = Form(...),
    image: UploadFile = File(None),
    speech_text: str = Form(None)
):
    import json
    h_data = json.loads(health_data)
    model_output = {"risk_probability": stroke_model_risk}
    
    img_bytes = await image.read() if image else None
    
    return stroke_guard_engine.full_assessment(
        health_data=h_data,
        stroke_model_output=model_output,
        image_bytes=img_bytes,
        speech_text=speech_text
    )

# Phase 21 Simulation Endpoints
@app.get("/api/simulation/presets")
async def get_simulation_presets():
    return simulation_engine.get_presets()

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

# Phase 22 Resource Planner Endpoints
@app.post("/api/resources/plan")
async def get_resource_plan(req: ResourcePlanRequest):
    return resource_planner.calculate_resource_needs(req.disease, req.region, req.predicted_cases, req.days)

@app.get("/api/resources/current-inventory")
async def get_inventory(region: str):
    import random
    return {
        "region": region,
        "beds": random.randint(10, 500),
        "medicine_units": random.randint(100, 5000),
        "personnel": random.randint(5, 50)
    }

@app.get("/api/resources/gap-analysis")
async def get_gap_analysis(disease: str, region: str, predicted_cases: int):
    return resource_planner.gap_analysis(region, disease, predicted_cases)

@app.get("/api/resources/full-report")
async def get_full_report(disease: str):
    regions = ["Maharashtra", "Delhi", "Karnataka"]
    report = []
    import random
    for r in regions:
        cases = random.randint(100, 5000)
        gap = resource_planner.gap_analysis(r, disease, cases)
        procurement = resource_planner.generate_procurement_plan(r, disease, 30)
        report.append({
            "region": r,
            "predicted_cases": cases,
            "gap_analysis": gap,
            "procurement_plan": procurement
        })
    transfers = resource_planner.optimize_distribution({}, regions, {})
    return {
        "disease": disease,
        "regional_reports": report,
        "transfers": transfers["transfers"]
    }

# Phase 25 Diet Planner Endpoints
@app.post("/api/diet/generate-plan")
async def generate_diet_plan(req: DietPlanRequest):
    return diet_engine.generate_plan(req.risk_profile, req.preferences)

@app.get("/api/diet/meals")
async def get_meals(category: Optional[str] = None, disease: Optional[str] = None, max_calories: Optional[int] = None):
    meals = diet_engine.meals
    if category:
        meals = [m for m in meals if m["category"] == category]
    if max_calories:
        meals = [m for m in meals if m["calories"] <= max_calories]
    if disease:
        # Filter meals that score well for this disease
        mock_profile = {disease: 80}
        meals = [m for m in meals if diet_engine.score_meal(m["name"], mock_profile) >= 70]
    return meals

@app.post("/api/diet/score-meal")
async def score_meal(req: MealScoreRequest):
    return {"score": diet_engine.score_meal(req.meal_name, req.risk_profile)}

@app.get("/api/diet/supplements")
async def get_supplements(risk_profile: str = Query(...)):
    import json
    profile = json.loads(risk_profile)
    return diet_engine.recommend_supplements(profile)

# Phase 26 Mental Health Endpoints
@app.post("/api/mental-health/assess")
async def assess_mental_health(req: MentalHealthAssessRequest, region_risk: float = 0, personal_risk: float = 0):
    assessment = mental_health_engine.assess_stress(req.responses)
    anxiety_index = mental_health_engine.compute_outbreak_anxiety_index(region_risk, personal_risk)
    recommendations = mental_health_engine.recommend_exercises(assessment["level"])
    crisis = mental_health_engine.crisis_flag(assessment["score"])
    
    return {
        "assessment": assessment,
        "anxiety_index": anxiety_index,
        "recommendations": recommendations,
        "crisis": crisis
    }

@app.get("/api/mental-health/exercises")
async def get_exercises(max_duration: Optional[int] = None, stress_level: str = "Normal"):
    return mental_health_engine.recommend_exercises(stress_level, max_duration)

@app.get("/api/mental-health/mood-trend")
async def get_mood_trend(history: str = Query(...)): # comma separated scores
    scores = [int(s) for s in history.split(",")]
    return {"trend": mental_health_engine.track_mood_trend(scores)}

@app.get("/api/mental-health/resources")
async def get_crisis_resources():
    return mental_health_engine.crisis_flag(10)["resources"]

# Phase 28 Continuous Learning Endpoints
@app.get("/api/learning/status")
async def get_learning_status():
    import random
    models = ["Dengue LSTM", "Malaria Prophet", "Influenza ARIMA", "Stroke Guard", "Personal Risk RF"]
    status = []
    for m in models:
        drift = model_monitor.compute_drift(m)
        status.append({
            "model_name": m,
            "last_trained": (datetime.utcnow() - timedelta(days=random.randint(1, 10))).isoformat(),
            "current_rmse": round(random.uniform(30, 60), 2),
            "drift_score": drift,
            "retrain_due": drift > 0.7 or random.random() > 0.8
        })
    return status

@app.post("/api/learning/trigger-retrain/{model_name}")
async def trigger_retrain(model_name: str):
    return retrainer.retrain_model(model_name, "Manual Trigger")

@app.get("/api/learning/performance-log")
async def get_performance_log(model: Optional[str] = None):
    return model_monitor.get_logs(model)

@app.get("/api/learning/improvements")
async def get_improvements():
    if not os.path.exists(retrainer.improvement_log):
        return []
    with open(retrainer.improvement_log, "r") as f:
        return json.load(f)

# Phase 29 Insurance Analytics Endpoints
@app.post("/api/insurance/premium")
async def calculate_premium(req: InsurancePremiumRequest):
    return insurance_engine.compute_risk_premium(req.user_profile, req.region_risk_score)

@app.get("/api/insurance/portfolio-risk")
async def get_portfolio_risk(region: str, disease_risk_avg: float):
    return insurance_engine.portfolio_risk_analysis(region, disease_risk_avg)

@app.get("/api/insurance/outbreak-liability")
async def get_liability(predicted_cases: int):
    return insurance_engine.outbreak_liability_estimate(predicted_cases)

# Phase 30 Drug Discovery Endpoints
@app.post("/api/drug-discovery/simulate")
async def simulate_drug(req: DrugSimulationRequest):
    sim_res = drug_discovery_engine.simulate_treatment(req.disease, req.protocol)
    # Mock impact calculation
    impact = drug_discovery_engine.population_impact(req.disease, 5000, sim_res["efficacy_pct"])
    return {**sim_res, "impact": impact}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
