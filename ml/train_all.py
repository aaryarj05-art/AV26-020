import os
import pandas as pd
from services.arima_model import ARIMAForecast
from services.prophet_model import ProphetForecast
from services.lstm_model import LSTMForecast

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'clean_outbreak_data.parquet')

def train_all():
    print("[ML] Helix Training Orchestrator starting...")
    
    if not os.path.exists(DATA_PATH):
        print(f"[ERR] Processed data not found at {DATA_PATH}. Run pipeline first.")
        return

    df = pd.read_parquet(DATA_PATH)
    diseases = df['disease'].unique()
    regions = df['region'].unique()
    
    results = []
    
    # For hackathon/speed, we'll train for top 2 diseases and 2 regions
    # But the script is built to handle all
    for disease in diseases[:3]: # Limit to 3 for demo speed
        for region in regions[:3]: # Limit to 3 for demo speed
            print(f"\n--- Training {disease} in {region} ---")
            
            # ARIMA
            arima = ARIMAForecast(disease, region)
            arima_metrics = arima.fit()
            
            # Prophet
            prophet = ProphetForecast(disease, region)
            prophet_metrics = prophet.fit()
            
            # LSTM
            lstm = LSTMForecast(disease, region)
            lstm_metrics = lstm.fit(epochs=10) # reduced epochs for orchestrator speed
            
            arima_rmse = arima_metrics.get('rmse', 0)
            prophet_rmse = prophet_metrics.get('rmse', 0)
            lstm_rmse = lstm_metrics.get('rmse', 0)
            
            # Determine best model
            rmses = {'ARIMA': arima_rmse, 'Prophet': prophet_rmse, 'LSTM': lstm_rmse}
            best_model = min(rmses, key=rmses.get)
            
            results.append({
                "Disease": disease,
                "Region": region,
                "ARIMA RMSE": round(arima_rmse, 2),
                "Prophet RMSE": round(prophet_rmse, 2),
                "LSTM RMSE": round(lstm_rmse, 2),
                "Best Model": best_model
            })
            
    print("\n" + "="*80)
    print("[ML] HELIX MODEL TRAINING SUMMARY")
    print("="*80)
    summary_df = pd.DataFrame(results)
    print(summary_df.to_string(index=False))
    print("="*80)

if __name__ == "__main__":
    train_all()
