import os
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(BASE_DIR, 'data', 'processed')
API_KEY = os.getenv("OPENWEATHER_API_KEY", "your_api_key_here")

CITIES = {
    "Mumbai": {"lat": 19.0760, "lon": 72.8777, "region": "Maharashtra"},
    "Delhi": {"lat": 28.6139, "lon": 77.2090, "region": "Delhi"},
    "Bangalore": {"lat": 12.9716, "lon": 77.5946, "region": "Karnataka"},
    "Chennai": {"lat": 13.0827, "lon": 80.2707, "region": "Tamil Nadu"},
    "Kochi": {"lat": 9.9312, "lon": 76.2673, "region": "Kerala"},
    "Kolkata": {"lat": 22.5726, "lon": 88.3639, "region": "West Bengal"},
    "Hyderabad": {"lat": 17.3850, "lon": 78.4867, "region": "Telangana"},
    "Pune": {"lat": 18.5204, "lon": 73.8567, "region": "Maharashtra"},
    "Jaipur": {"lat": 26.9124, "lon": 75.7873, "region": "Rajasthan"},
    "Lucknow": {"lat": 26.8467, "lon": 80.9462, "region": "Uttar Pradesh"}
}

class WeatherService:
    def __init__(self):
        os.makedirs(PROCESSED_DIR, exist_ok=True)

    def get_current(self, city):
        if city not in CITIES:
            return None
            
        coords = CITIES[city]
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={coords['lat']}&lon={coords['lon']}&appid={API_KEY}&units=metric"
        
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                return {
                    "temp": data['main']['temp'],
                    "humidity": data['main']['humidity'],
                    "rainfall": data.get('rain', {}).get('1h', 0),
                    "aqi": 50 # AQI requires a separate call, using placeholder
                }
        except:
            pass
            
        # Fallback to realistic mock if API fails/no key
        return self._get_mock_current(city)

    def _get_mock_current(self, city):
        # Very basic seasonal mock
        month = datetime.now().month
        is_monsoon = 6 <= month <= 9
        
        temp = 25 + np.random.uniform(-5, 5)
        humidity = 80 if is_monsoon else 50
        rainfall = np.random.uniform(0, 10) if is_monsoon else 0
        aqi = np.random.randint(30, 150)
        
        return {
            "temp": round(temp, 1),
            "humidity": humidity,
            "rainfall": round(rainfall, 1),
            "aqi": aqi
        }

    def get_historical_mock(self, city, weeks=156): # 3 years to match outbreak data
        print(f"Generating synthetic historical weather for {city}...")
        dates = [datetime.now() - timedelta(weeks=x) for x in range(weeks)]
        dates.reverse()
        
        records = []
        for d in dates:
            month = d.month
            is_monsoon = 6 <= month <= 9
            
            # Base patterns
            temp = 25 + (5 * np.sin(2 * np.pi * (month-1)/12)) # simple seasonal wave
            humidity = 75 if is_monsoon else 45
            rainfall = np.random.uniform(2, 20) if is_monsoon else np.random.uniform(0, 1)
            aqi = np.random.randint(40, 120)
            
            records.append({
                "date": d.strftime('%Y-%m-%d'),
                "city": city,
                "region": CITIES[city]["region"],
                "temperature": round(temp + np.random.normal(0, 2), 1),
                "humidity": int(humidity + np.random.normal(0, 5)),
                "rainfall": round(rainfall, 1),
                "aqi": aqi
            })
            
        return pd.DataFrame(records)

    def update_weather_data(self):
        all_weather = []
        for city in CITIES:
            df = self.get_historical_mock(city)
            all_weather.append(df)
            
        master_df = pd.concat(all_weather)
        output_path = os.path.join(PROCESSED_DIR, 'weather_data.csv')
        master_df.to_csv(output_path, index=False)
        print(f"Weather data updated and saved to {output_path}")
        return output_path

if __name__ == "__main__":
    ws = WeatherService()
    ws.update_weather_data()
