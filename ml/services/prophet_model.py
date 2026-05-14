import os
import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.metrics import mean_squared_error
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'clean_outbreak_data.parquet')
WEATHER_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'weather_data.csv')
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
        df_filtered = df[(df['disease'] == self.disease) & (df['region'] == self.region)].copy()
        
        # Load weather data for regressors
        if os.path.exists(WEATHER_PATH):
            w_df = pd.read_csv(WEATHER_PATH)
            w_df['date'] = pd.to_datetime(w_df['date'])
            df_filtered['date'] = pd.to_datetime(df_filtered['date'])
            
            # Merge weather (shifted by 2 weeks to represent lag)
            w_df_lagged = w_df[['date', 'region', 'rainfall', 'humidity']].copy()
            w_df_lagged['date'] = w_df_lagged['date'] + pd.Timedelta(weeks=2)
            
            df_filtered = pd.merge(df_filtered, w_df_lagged, on=['date', 'region'], how='left')
            # Fill missing values (due to lag) with mean, or absolute default if mean is NaN
            df_filtered['rainfall'] = df_filtered['rainfall'].fillna(df_filtered['rainfall'].mean()).fillna(0.0)
            df_filtered['humidity'] = df_filtered['humidity'].fillna(df_filtered['humidity'].mean()).fillna(50.0)
        
        # Prophet expects 'ds' and 'y' columns
        prophet_df = df_filtered[['date', 'cases', 'rainfall', 'humidity']].copy()
        prophet_df.columns = ['ds', 'y', 'rainfall', 'humidity']
        prophet_df['ds'] = pd.to_datetime(prophet_df['ds'])
        return prophet_df

    def fit(self):
        df = self._prepare_data()
        
        # Split into train/test
        train_size = int(len(df) * 0.8)
        train, test = df.iloc[:train_size], df.iloc[train_size:]
        
        print(f"Fitting Prophet for {self.disease} in {self.region} with environmental regressors...")
        
        # Initialize Prophet
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            interval_width=0.95
        )
        self.model.add_country_holidays(country_name='IN')
        
        # Add regressors
        self.model.add_regressor('rainfall')
        self.model.add_regressor('humidity')
        
        self.model.fit(train)
        
        # Evaluate
        self.evaluate(test)
        
        # Save model
        model_path = os.path.join(MODEL_DIR, f"prophet_{self.disease.lower()}_{self.region.lower().replace(' ', '_')}.pkl")
        joblib.dump(self.model, model_path)
        
        return self.metrics

    def evaluate(self, test_data):
        if len(test_data) == 0:
            return
            
        forecast = self.model.predict(test_data[['ds', 'rainfall', 'humidity']])
        rmse = np.sqrt(mean_squared_error(test_data['y'], forecast['yhat']))
        
        self.metrics = {
            "rmse": float(rmse)
        }
        print(f"Prophet Evaluation (with Regressors) - RMSE: {rmse:.2f}")

    def predict(self, periods=12):
        if self.model is None:
            model_path = os.path.join(MODEL_DIR, f"prophet_{self.disease.lower()}_{self.region.lower().replace(' ', '_')}.pkl")
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
            else:
                raise ValueError("Model not fitted and no saved artifact found.")
        
        future = self.model.make_future_dataframe(periods=periods, freq='W')
        
        # We need future values for regressors (mocking based on seasonality)
        # In Phase 5, we just use the last known values or seasonal averages
        future['rainfall'] = self._prepare_data()['rainfall'].iloc[-1]
        future['humidity'] = self._prepare_data()['humidity'].iloc[-1]
        
        forecast = self.model.predict(future)
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
