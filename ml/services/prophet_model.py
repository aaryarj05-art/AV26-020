import os
import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.metrics import mean_squared_error
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'clean_outbreak_data.parquet')
MODEL_DIR = os.path.join(BASE_DIR, 'models')

class ProphetForecast:
    def __init__(self, disease, region):
        self.disease = disease
        self.region = region
        self.model = None
        self.metrics = {}
        os.makedirs(MODEL_DIR, exist_ok=True)

    def _prepare_data(self):
        df = pd.read_parquet(DATA_PATH)
        df_filtered = df[(df['disease'] == self.disease) & (df['region'] == self.region)]
        
        # Prophet expects 'ds' and 'y' columns
        prophet_df = df_filtered[['date', 'cases']].copy()
        prophet_df.columns = ['ds', 'y']
        prophet_df['ds'] = pd.to_datetime(prophet_df['ds'])
        return prophet_df

    def fit(self):
        df = self._prepare_data()
        
        # Split into train/test
        train_size = int(len(df) * 0.8)
        train, test = df.iloc[:train_size], df.iloc[train_size:]
        
        print(f"Fitting Prophet for {self.disease} in {self.region}...")
        
        # Initialize Prophet with seasonality and Indian holidays
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            interval_width=0.95
        )
        self.model.add_country_holidays(country_name='IN')
        
        self.model.fit(train)
        
        # Evaluate
        self.evaluate(test)
        
        # Save model
        model_path = os.path.join(MODEL_DIR, f"prophet_{self.disease.lower()}_{self.region.lower().replace(' ', '_')}.pkl")
        joblib.dump(self.model, model_path)
        print(f"Model saved to {model_path}")
        
        return self.metrics

    def add_regressor(self, column):
        # Stub for Phase 5 (Environmental variables)
        print(f"Stub: add_regressor for {column} called.")
        pass

    def evaluate(self, test_data):
        if len(test_data) == 0:
            return
            
        forecast = self.model.predict(test_data[['ds']])
        rmse = np.sqrt(mean_squared_error(test_data['y'], forecast['yhat']))
        
        self.metrics = {
            "rmse": float(rmse)
        }
        print(f"Prophet Evaluation - RMSE: {rmse:.2f}")

    def predict(self, periods=12):
        if self.model is None:
            model_path = os.path.join(MODEL_DIR, f"prophet_{self.disease.lower()}_{self.region.lower().replace(' ', '_')}.pkl")
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
            else:
                raise ValueError("Model not fitted and no saved artifact found.")
        
        future = self.model.make_future_dataframe(periods=periods, freq='W')
        forecast = self.model.predict(future)
        
        # Extract only the future part
        future_forecast = forecast.tail(periods)
        
        return {
            "forecast": future_forecast['yhat'].tolist(),
            "lower_bound": future_forecast['yhat_lower'].tolist(),
            "upper_bound": future_forecast['yhat_upper'].tolist(),
            "metrics": self.metrics
        }

if __name__ == "__main__":
    forecaster = ProphetForecast("Dengue", "Maharashtra")
    forecaster.fit()
    print(forecaster.predict(periods=4))
