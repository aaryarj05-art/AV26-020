import random
import time
from functools import lru_cache
from fastapi import APIRouter

router = APIRouter(
    prefix="/api/map",
    tags=["map"]
)

REGIONS = [
    {"city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    {"city": "Delhi", "state": "Delhi", "lat": 28.7041, "lng": 77.1025},
    {"city": "Bangalore", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    {"city": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    {"city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    {"city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
    {"city": "Pune", "state": "Maharashtra", "lat": 18.5204, "lng": 73.8567},
    {"city": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lng": 72.5714},
    {"city": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    {"city": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lng": 80.9462}
]

DISEASES = ["Dengue", "Malaria", "Cholera", "Influenza"]

# Simple cache dictionary
_cache = {}

@router.get("/heatmap-data")
async def get_heatmap_data(forecast_mode: bool = False):
    """Returns all regions with risk scores, cases, disease breakdown, coordinates"""
    cache_key = f"heatmap_data_{forecast_mode}"
    if cache_key in _cache and time.time() - _cache[cache_key]["time"] < 60:
        return _cache[cache_key]["data"]

    data = []
    for r in REGIONS:
        # Mock logic
        cases = random.randint(10, 1000) if not forecast_mode else random.randint(20, 1500)
        risk = random.randint(10, 95)
        
        top_disease = random.choice(DISEASES)
        trend = random.choice(["Rising", "Stable", "Declining"])
        
        if risk > 80: level = "Critical"
        elif risk > 50: level = "High"
        elif risk > 30: level = "Medium"
        else: level = "Low"

        data.append({
            "city": r["city"],
            "state": r["state"],
            "lat": r["lat"],
            "lng": r["lng"],
            "cases": cases,
            "risk_score": risk,
            "risk_level": level,
            "top_disease": top_disease,
            "trend": trend
        })
        
    _cache[cache_key] = {"time": time.time(), "data": data}
    return data

@router.get("/region/{city}")
async def get_region_detail(city: str):
    """Detailed data for one region"""
    # Mock full outbreak detail
    return {
        "city": city,
        "active_alerts": random.randint(0, 3),
        "disease_breakdown": [
            {"name": "Dengue", "value": random.randint(10, 50)},
            {"name": "Malaria", "value": random.randint(10, 40)},
            {"name": "Influenza", "value": random.randint(20, 60)},
            {"name": "Cholera", "value": random.randint(0, 20)}
        ],
        "case_trend": [
            {"date": f"Day {-30+i}", "cases": random.randint(50, 500)} for i in range(30)
        ],
        "weather_correlation": {
            "temperature": random.randint(25, 40),
            "humidity": random.randint(40, 90),
            "rainfall": random.randint(0, 50)
        },
        "forecast": [
            {"week": f"Week {i+1}", "predicted_cases": random.randint(100, 600)} for i in range(4)
        ]
    }

@router.get("/timeline")
async def get_map_timeline():
    """Returns daily risk scores per region for last 30 days (for animation)"""
    timeline = []
    for day in range(30):
        day_data = []
        for r in REGIONS:
            day_data.append({
                "city": r["city"],
                "risk_score": random.randint(10, 95)
            })
        timeline.append({
            "day": -30 + day,
            "data": day_data
        })
    return timeline
