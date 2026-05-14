import json
import os

class MentalHealthEngine:
    def __init__(self, exercises_db_path="ml/data/wellness_exercises.json"):
        self.exercises_db_path = exercises_db_path
        self.exercises = self._load_exercises()

    def _load_exercises(self):
        if not os.path.exists(self.exercises_db_path):
            return []
        with open(self.exercises_db_path, "r") as f:
            return json.load(f)

    def assess_stress(self, responses):
        """
        PHQ-4 Assessment (4 questions, each scored 0-3)
        Returns: score (0-12) and severity level.
        """
        score = sum(responses)
        level = "Normal"
        if 4 <= score <= 6: level = "Mild"
        elif 7 <= score <= 9: level = "Moderate"
        elif score >= 10: level = "Severe"
        
        return {"score": score, "level": level}

    def compute_outbreak_anxiety_index(self, region_risk_score, personal_risk_score):
        """
        Higher outbreak risk + higher personal risk = higher anxiety index.
        """
        # Weighted combination (e.g., 60% region, 40% personal)
        index = (region_risk_score * 0.6) + (personal_risk_score * 0.4)
        return round(min(index, 100), 1)

    def recommend_exercises(self, stress_level, time_available_minutes=None):
        """
        Filters exercises based on stress level and available time.
        """
        # Map stress level to preferred exercise types
        preferred_types = ["Breathing", "Mindfulness"]
        if stress_level in ["Normal", "Mild"]:
            preferred_types.extend(["Movement", "Cognitive"])
            
        filtered = [e for e in self.exercises if e["type"] in preferred_types]
        
        if time_available_minutes:
            filtered = [e for e in filtered if e["duration_minutes"] <= time_available_minutes]
            
        # Ensure we return at least something
        return filtered if filtered else self.exercises[:3]

    def track_mood_trend(self, mood_history):
        """
        Analyzes trend over last 14 days.
        """
        if len(mood_history) < 2:
            return "Stable"
            
        # Compare first half with second half of the history
        mid = len(mood_history) // 2
        avg1 = sum(mood_history[:mid]) / mid
        avg2 = sum(mood_history[mid:]) / (len(mood_history) - mid)
        
        diff = avg2 - avg1
        if diff > 1.0: return "Improving"
        if diff < -1.0: return "Declining"
        return "Stable"

    def crisis_flag(self, score):
        """
        Checks if the score suggests a crisis.
        """
        is_crisis = score >= 10
        resources = []
        if is_crisis:
            resources = [
                {"name": "iCall", "contact": "9152987821", "info": "Free, confidential counseling"},
                {"name": "Vandrevala Foundation", "contact": "1860-2662-345", "info": "24/7 Crisis Support"}
            ]
        return {"is_crisis": is_crisis, "resources": resources}
