import random
from typing import Dict, List, Any

class ResourcePlanner:
    def __init__(self):
        self.disease_profiles = {
            "Dengue": {
                "hospitalization_rate": 0.15,
                "avg_days": 4,
                "meds_per_case": 5, # IV fluids, meds
                "severity_ratio": 1.0
            },
            "Malaria": {
                "hospitalization_rate": 0.25,
                "avg_days": 5,
                "meds_per_case": 3, # ACT
                "severity_ratio": 1.2
            },
            "Cholera": {
                "hospitalization_rate": 0.20,
                "avg_days": 3,
                "meds_per_case": 10, # ORS + IV
                "severity_ratio": 1.1
            },
            "Influenza": {
                "hospitalization_rate": 0.05,
                "avg_days": 3,
                "meds_per_case": 2, # Antivirals
                "severity_ratio": 0.8
            }
        }
        self.nurse_to_patient_ratio = 6  # 1 nurse for 6 patients
        self.shift_hours = 8
        self.ambulance_utilization_rate = 0.02 # 2% of cases need ambulance transport

    def calculate_resource_needs(self, disease: str, region: str, predicted_cases: int, days_ahead: int = 14) -> Dict[str, Any]:
        profile = self.disease_profiles.get(disease, self.disease_profiles["Dengue"])
        
        hospitalized_cases = predicted_cases * profile["hospitalization_rate"]
        bed_days_needed = hospitalized_cases * profile["severity_ratio"] * profile["avg_days"]
        
        buffer_factor = 1.2
        medicine_units = predicted_cases * profile["meds_per_case"] * buffer_factor
        
        personnel_needed = bed_days_needed / (self.nurse_to_patient_ratio * (24 / self.shift_hours)) # rough estimate of daily staff
        
        ambulances = predicted_cases * self.ambulance_utilization_rate
        
        return {
            "region": region,
            "disease": disease,
            "predicted_cases": predicted_cases,
            "beds_needed": int(hospitalized_cases), # simultaneous beds
            "bed_days_needed": int(bed_days_needed),
            "medicine_units": int(medicine_units),
            "personnel_needed": int(personnel_needed),
            "ambulances_needed": int(ambulances)
        }

    def generate_procurement_plan(self, region: str, disease: str, timeline_days: int) -> List[Dict[str, Any]]:
        # Fake procurement plan generation
        items = []
        if disease == "Dengue":
            items = [
                {"item": "IV Fluids (RL)", "category": "Consumable", "priority": "High", "cost_est": 50000},
                {"item": "Paracetamol IV", "category": "Medicine", "priority": "Medium", "cost_est": 15000},
                {"item": "Platelet Kits", "category": "Diagnostic", "priority": "Critical", "cost_est": 120000}
            ]
        elif disease == "Malaria":
            items = [
                {"item": "ACT Medication", "category": "Medicine", "priority": "Critical", "cost_est": 80000},
                {"item": "Rapid Diagnostic Tests", "category": "Diagnostic", "priority": "High", "cost_est": 30000}
            ]
        else:
            items = [
                {"item": "Generic Antibiotics", "category": "Medicine", "priority": "Medium", "cost_est": 40000},
                {"item": "PPE Kits", "category": "Consumable", "priority": "High", "cost_est": 25000}
            ]
            
        return items

    def optimize_distribution(self, resources: Dict, regions: List[str], distance_matrix: Dict) -> Dict:
        # Placeholder for greedy allocation algorithm
        transfers = [
            {"from": "Mumbai", "to": "Pune", "item": "Beds", "quantity": 50, "logistics_days": 2},
            {"from": "Delhi", "to": "Jaipur", "item": "Medicine Units", "quantity": 1000, "logistics_days": 1}
        ]
        return {
            "status": "optimized",
            "transfers": transfers
        }

    def gap_analysis(self, region: str, disease: str, predicted_cases: int) -> Dict:
        needs = self.calculate_resource_needs(disease, region, predicted_cases)
        
        # Mock current inventory
        current_beds = random.randint(10, 500)
        current_meds = random.randint(100, 5000)
        current_personnel = random.randint(5, 50)
        
        return {
            "region": region,
            "beds": {
                "current": current_beds,
                "needed": needs["beds_needed"],
                "gap": max(0, needs["beds_needed"] - current_beds),
                "status": "critical" if current_beds < needs["beds_needed"] else "sufficient"
            },
            "medicine": {
                "current": current_meds,
                "needed": needs["medicine_units"],
                "gap": max(0, needs["medicine_units"] - current_meds),
                "status": "low" if current_meds < needs["medicine_units"] else "sufficient"
            },
            "personnel": {
                "current": current_personnel,
                "needed": needs["personnel_needed"],
                "gap": max(0, needs["personnel_needed"] - current_personnel),
                "status": "critical" if current_personnel < needs["personnel_needed"] else "sufficient"
            }
        }
