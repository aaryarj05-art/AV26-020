import os
import random
from datetime import datetime, timedelta
from typing import Dict, List

class FusionService:
    def __init__(self):
        self.sources = {
            "Historical Data": {"status": "healthy", "last_updated": "2m ago", "reliability": 0.95},
            "Environmental Factors": {"status": "warning", "last_updated": "15m ago", "reliability": 0.78},
            "Real-time Symptoms": {"status": "healthy", "last_updated": "Now", "reliability": 0.92}
        }

    def get_status(self, region: str = "Maharashtra") -> Dict:
        """Returns the current status of all data fusion sources."""
        # Simulated logic for hackathon demonstration
        now = datetime.now()
        
        # Update mock relative times
        self.sources["Historical Data"]["last_updated"] = "2m ago"
        self.sources["Environmental Factors"]["last_updated"] = f"{random.randint(10, 20)}m ago"
        self.sources["Real-time Symptoms"]["last_updated"] = "Now"
        
        # Calculate overall confidence
        avg_reliability = sum(s["reliability"] for s in self.sources.values()) / len(self.sources)
        confidence = int(avg_reliability * 100) - random.randint(0, 5)

        return {
            "region": region,
            "sources": [
                {"name": name, "status": data["status"], "updated": data["last_updated"]}
                for name, data in self.sources.items()
            ],
            "overall_confidence": confidence,
            "fusion_method": "Weighted Attribution",
            "last_sync": now.isoformat()
        }

    def get_contribution(self, disease: str, region: str) -> Dict:
        """Returns the contribution percentage of each data source to the final prediction."""
        # Weighted contribution varies by disease
        weights = {
            "Dengue": {"Historical": 0.3, "Environmental": 0.5, "Symptoms": 0.2},
            "Malaria": {"Historical": 0.3, "Environmental": 0.5, "Symptoms": 0.2},
            "Cholera": {"Historical": 0.4, "Environmental": 0.2, "Symptoms": 0.4},
            "Influenza": {"Historical": 0.2, "Environmental": 0.1, "Symptoms": 0.7},
            "COVID-19": {"Historical": 0.2, "Environmental": 0.1, "Symptoms": 0.7}
        }
        
        contrib = weights.get(disease, {"Historical": 0.33, "Environmental": 0.33, "Symptoms": 0.34})
        
        return {
            "disease": disease,
            "region": region,
            "contributions": [
                {"source": "Historical Outbreaks", "weight": contrib["Historical"]},
                {"source": "Environmental Sensors", "weight": contrib["Environmental"]},
                {"source": "Symptom Clustering", "weight": contrib["Symptoms"]}
            ]
        }

    def fusion_predict(self, data: Dict) -> Dict:
        """Placeholder for advanced fusion prediction logic."""
        return {
            "status": "success",
            "message": "Fusion inference complete",
            "engine": "Helix Fusion v1.0"
        }
