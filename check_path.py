import sys, os
sys.path.append(os.path.abspath('ml'))
from services.arima_model import ARIMAForecast, MODEL_DIR
m = ARIMAForecast("Dengue", "Maharashtra")
p = os.path.join(MODEL_DIR, f"arima_{m.disease.lower()}_{m.region.lower().replace(' ', '_')}.pkl")
print(f"Path: {p}")
print(f"Exists: {os.path.exists(p)}")
