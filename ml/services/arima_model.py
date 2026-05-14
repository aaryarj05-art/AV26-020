import os
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from pmdarima import auto_arima
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'clean_outbreak_data.parquet')
MODEL_DIR = os.path.join(BASE_DIR, 'models')

class ARIMAForecast:
    def __init__(self, disease, region):
        self.disease = disease
        self.region = region
        self.model = None
        self.results = None
        self.metrics = {}
        self.data = None
        os.makedirs(MODEL_DIR, exist_ok=True)

    def _prepare_data(self):
        df = pd.read_parquet(DATA_PATH)
        df_filtered = df[(df['disease'] == self.disease) & (df['region'] == self.region)]
        df_filtered = df_filtered.sort_values('date')
        df_filtered.set_index('date', inplace=True)
        self.data = df_filtered['cases']
        return self.data

    def fit(self):
        series = self._prepare_data()
        
        # Split into train/test (last 20% for testing)
        train_size = int(len(series) * 0.8)
        train, test = series[:train_size], series[train_size:]
        
        print(f"Fitting ARIMA for {self.disease} in {self.region}...")
        
        try:
            # Auto-ARIMA to find best parameters
            auto_model = auto_arima(train, seasonal=True, m=52, suppress_warnings=True, error_action="ignore")
            order = auto_model.order
            seasonal_order = auto_model.seasonal_order
            print(f"Auto-ARIMA found order: {order}, seasonal: {seasonal_order}")
        except Exception as e:
            print(f"Auto-ARIMA failed, using default (2,1,2): {e}")
            order = (2, 1, 2)
            seasonal_order = (0, 0, 0, 0)

        # Fit model on full training set
        self.model = ARIMA(train, order=order, seasonal_order=seasonal_order)
        self.results = self.model.fit()
        
        # Evaluate
        self.evaluate(test)
        
        # Save model
        model_path = os.path.join(MODEL_DIR, f"arima_{self.disease.lower()}_{self.region.lower().replace(' ', '_')}.pkl")
        joblib.dump(self.results, model_path)
        print(f"Model saved to {model_path}")
        
        return self.metrics

    def evaluate(self, test_data):
        if len(test_data) == 0:
            return
            
        forecast = self.results.forecast(steps=len(test_data))
        rmse = np.sqrt(mean_squared_error(test_data, forecast))
        mae = mean_absolute_error(test_data, forecast)
        
        self.metrics = {
            "rmse": float(rmse),
            "mae": float(mae)
        }
        print(f"ARIMA Evaluation - RMSE: {rmse:.2f}, MAE: {mae:.2f}")

    def predict(self, steps=12):
        if self.results is None:
            # Try to load if not fitted
            model_path = os.path.join(MODEL_DIR, f"arima_{self.disease.lower()}_{self.region.lower().replace(' ', '_')}.pkl")
            if os.path.exists(model_path):
                self.results = joblib.load(model_path)
            else:
                raise ValueError("Model not fitted and no saved artifact found.")
        
        forecast_res = self.results.get_forecast(steps=steps)
        forecast = forecast_res.summary_frame()
        
        return {
            "forecast": forecast['mean'].tolist(),
            "lower_bound": forecast['mean_ci_lower'].tolist(),
            "upper_bound": forecast['mean_ci_upper'].tolist(),
            "metrics": self.metrics
        }

if __name__ == "__main__":
    # Test fitting one
    forecaster = ARIMAForecast("Dengue", "Maharashtra")
    forecaster.fit()
    print(forecaster.predict(steps=4))
