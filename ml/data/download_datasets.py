import os
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(DATA_DIR, 'raw')
os.makedirs(RAW_DIR, exist_ok=True)

def fetch_who_data():
    """Fetch indicator data from WHO Global Health Observatory API"""
    print("Fetching WHO Global Health Observatory data...")
    try:
        # Example: Cholera cases (just an indicator, using a small subset for demonstration)
        url = "https://ghoapi.azureedge.net/api/Indicator"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        indicators_df = pd.DataFrame(data['value'])
        output_path = os.path.join(RAW_DIR, 'who_indicators.csv')
        indicators_df.to_csv(output_path, index=False)
        print(f"Successfully downloaded WHO indicators to {output_path}")
        return True
    except Exception as e:
        print(f"Failed to fetch WHO data: {e}")
        return False

def generate_synthetic_outbreak_data():
    """Generate realistic synthetic outbreak data as fallback"""
    print("Generating synthetic outbreak dataset...")
    
    diseases = ['Dengue', 'Malaria', 'Cholera', 'Influenza', 'COVID-19']
    regions = [
        'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Kerala',
        'Gujarat', 'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Madhya Pradesh'
    ]
    
    # Base populations for regions (synthetic)
    populations = {
        'Maharashtra': 120000000, 'Delhi': 30000000, 'Karnataka': 65000000,
        'Tamil Nadu': 75000000, 'Kerala': 35000000, 'Gujarat': 63000000,
        'Uttar Pradesh': 220000000, 'West Bengal': 95000000, 'Rajasthan': 75000000,
        'Madhya Pradesh': 80000000
    }
    
    start_date = datetime(2021, 1, 1)
    weeks = 156 # 3 years
    
    records = []
    
    for region in regions:
        for disease in diseases:
            base_rate = np.random.uniform(0.0001, 0.001)
            seasonality_shift = np.random.randint(0, 52)
            
            for week in range(weeks):
                current_date = start_date + timedelta(weeks=week)
                
                # Create some seasonality
                seasonality = np.sin((week + seasonality_shift) * (2 * np.pi / 52)) * 0.5 + 0.5
                
                # Add some random outbreaks (spikes)
                outbreak_multiplier = 1.0
                if np.random.random() < 0.05: # 5% chance of an outbreak spike in a given week
                    outbreak_multiplier = np.random.uniform(2.0, 10.0)
                
                # Calculate cases
                cases = int(populations[region] * base_rate * seasonality * outbreak_multiplier * np.random.uniform(0.8, 1.2))
                
                # Calculate deaths and recovered based on typical CFRs (synthetic)
                cfr = {
                    'Dengue': 0.01, 'Malaria': 0.005, 'Cholera': 0.02, 
                    'Influenza': 0.001, 'COVID-19': 0.015
                }
                
                deaths = int(cases * cfr[disease] * np.random.uniform(0.5, 1.5))
                recovered = cases - deaths
                
                # Introduce occasional missing data to test pipeline
                if np.random.random() < 0.02:
                    cases = np.nan
                
                records.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'region': region,
                    'disease': disease,
                    'cases': cases,
                    'deaths': deaths,
                    'recovered': recovered,
                    'population': populations[region]
                })
                
    df = pd.DataFrame(records)
    output_path = os.path.join(RAW_DIR, 'synthetic_outbreak_data.csv')
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} synthetic records to {output_path}")

if __name__ == "__main__":
    fetch_who_data()
    generate_synthetic_outbreak_data()
