import os
import pandas as pd
import numpy as np
from datetime import datetime
from .arima_model import ARIMAForecast
from .prophet_model import ProphetForecast
from .lstm_model import LSTMForecast

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'clean_outbreak_data.parquet')
MODEL_DIR = os.path.join(BASE_DIR, 'models')

class PredictionService:
    def __init__(self):
        pass

    def run_ensemble(self, disease, region, steps=12):
        import time
        t0 = time.time()
        arima = ARIMAForecast(disease, region)
        prophet = ProphetForecast(disease, region)
        lstm = LSTMForecast(disease, region)
        
        print(f"[{region}] Loading/Fitting ARIMA...")
        # Load or fit all models
        try:
            arima_pred = arima.predict(steps=steps)
            print(f"[{region}] ARIMA loaded in {time.time() - t0:.2f}s")
        except Exception as e:
            print(f"[{region}] ARIMA load failed ({e}), fitting...")
            arima.fit()
            arima_pred = arima.predict(steps=steps)
            print(f"[{region}] ARIMA fitted in {time.time() - t0:.2f}s")
            
        t1 = time.time()
        print(f"[{region}] Loading/Fitting Prophet...")
        try:
            prophet_pred = prophet.predict(periods=steps)
            print(f"[{region}] Prophet loaded in {time.time() - t1:.2f}s")
        except Exception as e:
            print(f"[{region}] Prophet load failed ({e}), fitting...")
            prophet.fit()
            prophet_pred = prophet.predict(periods=steps)
            print(f"[{region}] Prophet fitted in {time.time() - t1:.2f}s")
 
        t2 = time.time()
        print(f"[{region}] Loading/Fitting LSTM...")
        try:
            lstm_pred = lstm.predict(steps=steps)
            print(f"[{region}] LSTM loaded in {time.time() - t2:.2f}s")
        except Exception as e:
            print(f"[{region}] LSTM load failed ({e}), fitting...")
            lstm.fit()
            lstm_pred = lstm.predict(steps=steps)
            print(f"[{region}] LSTM fitted in {time.time() - t2:.2f}s")
            
        # Ensemble: weighted average (ARIMA: 30%, Prophet: 30%, LSTM: 40%)
        # Ensure all lists are same length
        ensemble_forecast = []
        for i in range(steps):
            w_avg = (
                (arima_pred['forecast'][i] * 0.3) +
                (prophet_pred['forecast'][i] * 0.3) +
                (lstm_pred['forecast'][i] * 0.4)
            )
            ensemble_forecast.append(w_avg)
        
        # Combine bounds (simplified for ensemble)
        lower_bound = [
            min(a, p, l) for a, p, l in zip(arima_pred['lower_bound'], prophet_pred['lower_bound'], lstm_pred['lower_bound'])
        ]
        upper_bound = [
            max(a, p, l) for a, p, l in zip(arima_pred['upper_bound'], prophet_pred['upper_bound'], lstm_pred['upper_bound'])
        ]
        
        return {
            "model": "ensemble",
            "forecast": ensemble_forecast,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
            "arima_metrics": arima_pred['metrics'],
            "prophet_metrics": prophet_pred['metrics'],
            "lstm_metrics": lstm_pred['metrics']
        }

    def get_seasonal_trends(self, disease):
        df = pd.read_parquet(DATA_PATH)
        df_filtered = df[df['disease'] == disease]
        seasonal = df_filtered.groupby('month')['cases'].mean().tolist()
        return {
            "disease": disease,
            "monthly_avg": seasonal
        }

    def get_risk_score(self, disease, region):
        df = pd.read_parquet(DATA_PATH)
        df_filtered = df[(df['disease'] == disease) & (df['region'] == region)]
        
        avg_cases = df_filtered['cases'].mean()
        last_cases = df_filtered['cases'].iloc[-1]
        
        pred = self.run_ensemble(disease, region, steps=4)
        pred_avg = np.mean(pred['forecast'])
        
        ratio = pred_avg / max(avg_cases, 1)
        risk_score = min(max(ratio * 50, 0), 100)
        
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
            if f.endswith('.pkl') or f.endswith('.h5'):
                ext = '.h5' if f.endswith('.h5') else '.pkl'
                # filter out scalers
                if 'scaler_' in f: continue
                
                parts = f.replace(ext, '').split('_')
                if len(parts) >= 3:
                    models.append({
                        "name": f,
                        "type": parts[0],
                        "disease": parts[1],
                        "region": "_".join(parts[2:])
                    })
        return models
        
    def get_all_metrics(self):
        # In a real scenario, we'd store these in a JSON/DB
        # For Phase 4, we'll try to reconstruct from a few samples
        # or return trained model metrics
        diseases = ['Dengue', 'Malaria', 'Cholera', 'Influenza', 'COVID-19']
        regions = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Kerala']
        
        metrics_table = []
        for d in diseases:
            for r in regions:
                # This is heavy to run on the fly, usually we'd have a metrics store
                # We'll return dummy placeholders if not available or just trained status
                metrics_table.append({
                    "disease": d,
                    "region": r,
                    "arima_rmse": 42.5, # placeholders for now
                    "prophet_rmse": 38.2,
                    "lstm_rmse": 35.1,
                    "best": "LSTM"
                })
        return metrics_table
