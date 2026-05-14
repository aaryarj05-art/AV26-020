import random
from datetime import datetime, timedelta

class DataFusionEngine:
    def __init__(self):
        self.sources = {
            "historical": {"weight": 0.5, "status": "active"},
            "environmental": {"weight": 0.3, "status": "active"},
            "realtime_symptoms": {"weight": 0.2, "status": "active"}
        }

    def fuse(self, disease, region, date):
        """Weighted combination of all 3 sources"""
        # For the hackathon MVP, we mock the actual fusion prediction logic
        historical_pred = random.uniform(100, 500)
        env_modifier = random.uniform(0.8, 1.2)
        symptom_modifier = random.uniform(0.9, 1.3)
        
        fused_prediction = (
            historical_pred * self.sources["historical"]["weight"] +
            (historical_pred * env_modifier) * self.sources["environmental"]["weight"] +
            (historical_pred * symptom_modifier) * self.sources["realtime_symptoms"]["weight"]
        )
        return {"fused_prediction": round(fused_prediction, 2)}

    def get_source_contributions(self, disease, region):
        """Returns % contribution of each source to current prediction"""
        return [
            {"name": "Historical", "value": self.sources["historical"]["weight"] * 100},
            {"name": "Environmental", "value": self.sources["environmental"]["weight"] * 100},
            {"name": "Real-time Symptoms", "value": self.sources["realtime_symptoms"]["weight"] * 100}
        ]

    def compute_fusion_confidence(self, region):
        """Confidence score based on data freshness and coverage"""
        # Logic: If all 3 sources are active, confidence is high
        active_sources = sum(1 for v in self.sources.values() if v["status"] == "active")
        base_confidence = (active_sources / 3) * 100
        # Add slight randomness for realism
        return round(min(100, max(0, base_confidence - random.uniform(0, 10))), 1)

    def update_weights_dynamic(self, performance_history):
        """Adjust weights based on which source was most accurate historically"""
        # Mock logic: adjust randomly slightly
        total = 0
        for k in self.sources.keys():
            self.sources[k]["weight"] += random.uniform(-0.05, 0.05)
            self.sources[k]["weight"] = max(0.05, self.sources[k]["weight"])
            total += self.sources[k]["weight"]
            
        # Normalize
        for k in self.sources.keys():
            self.sources[k]["weight"] = round(self.sources[k]["weight"] / total, 2)
            
        return self.sources

    def detect_data_gaps(self, region):
        """Flag if any source has missing/stale data"""
        gaps = []
        if random.random() < 0.1:  # 10% chance of a gap for demo
            gaps.append({"source": "realtime_symptoms", "issue": "Stale data (> 24h)"})
        return gaps

    def get_status(self, region):
        """Returns full status of all sources"""
        now = datetime.now()
        return {
            "region": region,
            "confidence": self.compute_fusion_confidence(region),
            "sources": [
                {
                    "name": "Historical",
                    "last_updated": (now - timedelta(hours=2)).isoformat(),
                    "record_count": 7800,
                    "weight": round(self.sources["historical"]["weight"] * 100),
                    "status": "Healthy"
                },
                {
                    "name": "Environmental",
                    "last_updated": (now - timedelta(minutes=15)).isoformat(),
                    "record_count": "Live",
                    "weight": round(self.sources["environmental"]["weight"] * 100),
                    "status": "Healthy"
                },
                {
                    "name": "Real-time Symptoms",
                    "last_updated": (now - timedelta(minutes=45)).isoformat(),
                    "record_count": random.randint(20, 150),
                    "weight": round(self.sources["realtime_symptoms"]["weight"] * 100),
                    "status": "Degraded" if self.detect_data_gaps(region) else "Healthy"
                }
            ],
            "gaps": self.detect_data_gaps(region)
        }
