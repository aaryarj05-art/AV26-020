import os
import pandas as pd
import numpy as np
from scipy.stats import pearsonr, spearmanr
from .weather_service import CITIES

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTBREAK_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'clean_outbreak_data.parquet')
WEATHER_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'weather_data.csv')

class CorrelationEngine:
    def __init__(self):
        self.weather_df = None
        self.outbreak_df = None

    def _load_data(self):
        if self.outbreak_df is None:
            self.outbreak_df = pd.read_parquet(OUTBREAK_PATH)
            self.outbreak_df['date'] = pd.to_datetime(self.outbreak_df['date'])
        if self.weather_df is None:
            if not os.path.exists(WEATHER_PATH):
                from .weather_service import WeatherService
                ws = WeatherService()
                ws.update_weather_data()
            self.weather_df = pd.read_csv(WEATHER_PATH)
            self.weather_df['date'] = pd.to_datetime(self.weather_df['date'])

    def compute_correlations(self, disease, region):
        self._load_data()
        
        # Filter data
        o_df = self.outbreak_df[(self.outbreak_df['disease'] == disease) & (self.outbreak_df['region'] == region)]
        w_df = self.weather_df[self.weather_df['region'] == region]
        
        # Merge on date
        merged = pd.merge(o_df, w_df, on=['date', 'region'])
        
        results = {}
        weather_vars = ['temperature', 'humidity', 'rainfall', 'aqi']
        
        for var in weather_vars:
            results[var] = {}
            for lag in [0, 1, 2, 3, 4]:
                # Shift weather variable forward (so weather at t matches cases at t+lag)
                series_weather = merged[var].shift(lag)
                series_cases = merged['cases']
                
                # Drop NaNs after shift
                valid = ~(series_weather.isna() | series_cases.isna())
                if valid.sum() > 10:
                    corr, _ = pearsonr(series_weather[valid], series_cases[valid])
                    results[var][f"lag_{lag}"] = round(corr, 3)
                else:
                    results[var][f"lag_{lag}"] = 0
                    
        return results

    def get_risk_multiplier(self, current_weather, disease):
        """
        Returns a 0.5 - 2.0 multiplier based on current weather conditions.
        Rules:
        - Dengue: High if rainfall > 5mm and humidity > 70%
        - Malaria: High if temp 22-30C and humidity > 60%
        - Cholera: High if rainfall > 10mm (sanitation risk)
        - Influenza: High if temp < 15C and humidity < 40%
        """
        temp = current_weather.get('temp', 25)
        humidity = current_weather.get('humidity', 50)
        rainfall = current_weather.get('rainfall', 0)
        
        multiplier = 1.0
        
        if disease == 'Dengue':
            if rainfall > 5: multiplier += 0.4
            if humidity > 70: multiplier += 0.3
            if temp > 28: multiplier += 0.1
            
        elif disease == 'Malaria':
            if 22 <= temp <= 32: multiplier += 0.3
            if humidity > 65: multiplier += 0.4
            if rainfall > 3: multiplier += 0.2
            
        elif disease == 'Cholera':
            if rainfall > 10: multiplier += 0.6
            if temp > 30: multiplier += 0.2
            
        elif disease == 'Influenza':
            if temp < 18: multiplier += 0.5
            if humidity < 40: multiplier += 0.3
            
        return round(min(max(multiplier, 0.5), 2.0), 2)

    def fit_regression(self, disease, region):
        # Basic OLS placeholder logic for Phase 5
        # cases = b0 + b1*temp_lag2 + b2*hum_lag2 + b3*rain_lag3
        corrs = self.compute_correlations(disease, region)
        # return the highest correlation info as a simple R2 proxy
        max_corr = 0
        for var in corrs:
            for lag in corrs[var]:
                max_corr = max(max_corr, abs(corrs[var][lag]))
        
        return {
            "r_squared": round(max_corr**2, 3),
            "primary_driver": "rainfall" if corrs['rainfall']['lag_2'] > 0.4 else "temperature"
        }

if __name__ == "__main__":
    engine = CorrelationEngine()
    print(engine.compute_correlations("Dengue", "Maharashtra"))
