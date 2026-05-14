import os
import pandas as pd
import numpy as np
from datetime import datetime
from .arima_model import ARIMAForecast
from .prophet_model import ProphetForecast

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'clean_outbreak_data.parquet')
MODEL_DIR = os.path.join(BASE_DIR, 'models')

class PredictionService:
    def __init__(self):
        pass

    def run_ensemble(self, disease, region, steps=12):
        print(f"Running ensemble for {disease} in {region}...")
        
        arima = ARIMAForecast(disease, region)
        prophet = ProphetForecast(disease, region)
        
        # In a real app, we'd check if models exist before fitting
        # For hackathon/demo, we ensure they are fitted
        try:
            arima_pred = arima.predict(steps=steps)
        except:
            arima.fit()
            arima_pred = arima.predict(steps=steps)
            
        try:
            prophet_pred = prophet.predict(periods=steps)
        except:
            prophet.fit()
            prophet_pred = prophet.predict(periods=steps)
            
        # Ensemble: simple average
        ensemble_forecast = [
            (a + p) / 2 for a, p in zip(arima_pred['forecast'], prophet_pred['forecast'])
        ]
        
        # Combine bounds
        lower_bound = [
            min(a, p) for a, p in zip(arima_pred['lower_bound'], prophet_pred['lower_bound'])
        ]
        upper_bound = [
            max(a, p) for a, p in zip(arima_pred['upper_bound'], prophet_pred['upper_bound'])
        ]
        
        return {
            "model": "ensemble",
            "forecast": ensemble_forecast,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
            "arima_metrics": arima_pred['metrics'],
            "prophet_metrics": prophet_pred['metrics']
        }

    def get_seasonal_trends(self, disease):
        df = pd.read_parquet(DATA_PATH)
        df_filtered = df[df['disease'] == disease]
        
        # Group by month and average
        seasonal = df_filtered.groupby('month')['cases'].mean().tolist()
        return {
            "disease": disease,
            "monthly_avg": seasonal
        }

    def get_risk_score(self, disease, region):
        # 0-100 score based on current trajectory
        # Simple logic: forecast vs historical average
        df = pd.read_parquet(DATA_PATH)
        df_filtered = df[(df['disease'] == disease) & (df['region'] == region)]
        
        avg_cases = df_filtered['cases'].mean()
        last_cases = df_filtered['cases'].iloc[-1]
        
        # Prediction for next 4 weeks
        pred = self.run_ensemble(disease, region, steps=4)
        pred_avg = np.mean(pred['forecast'])
        
        # Risk factor: combination of trend and volume
        # (pred_avg / avg_cases) gives ratio of expected vs historical
        # Clamp to 0-100 range
        ratio = pred_avg / max(avg_cases, 1)
        risk_score = min(max(ratio * 50, 0), 100) # 1.0 ratio = 50 score
        
        return {
            "disease": disease,
            "region": region,
            "risk_score": round(risk_score, 1),
            "trend": "rising" if pred_avg > last_cases else "falling"
        }

    def get_models_status(self):
        models = []
        if not os.path.exists(MODEL_DIR):
            return models
            
        for f in os.listdir(MODEL_DIR):
            if f.endswith('.pkl'):
                parts = f.replace('.pkl', '').split('_')
                # format: type_disease_region
                if len(parts) >= 3:
                    models.append({
                        "name": f,
                        "type": parts[0],
                        "disease": parts[1],
                        "region": "_".join(parts[2:])
                    })
        return models
