import json
import random
import os

class DietEngine:
    def __init__(self, meals_db_path="ml/data/meals_database.json"):
        self.meals_db_path = meals_db_path
        self.meals = self._load_meals()

    def _load_meals(self):
        if not os.path.exists(self.meals_db_path):
            return []
        with open(self.meals_db_path, "r") as f:
            return json.load(f)

    def generate_plan(self, risk_profile, preferences=None):
        """
        Creates a 7-day meal plan based on risk profile.
        """
        plan = {}
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        for day in days:
            plan[day] = {
                "Breakfast": self._get_best_meal("Breakfast", risk_profile),
                "Lunch": self._get_best_meal("Lunch", risk_profile),
                "Dinner": self._get_best_meal("Dinner", risk_profile),
                "Snacks": self._get_best_meal("Snacks", risk_profile)
            }
            
        return plan

    def _get_best_meal(self, category, risk_profile):
        category_meals = [m for m in self.meals if m["category"] == category]
        if not category_meals:
            return None
            
        # Score each meal and pick the top few, then random choice for variety
        scored_meals = []
        for meal in category_meals:
            score = self.score_meal(meal["name"], risk_profile)
            scored_meals.append((score, meal))
            
        scored_meals.sort(key=lambda x: x[0], reverse=True)
        # Take top 5 for variety
        top_meals = scored_meals[:5]
        return random.choice(top_meals)[1] if top_meals else random.choice(category_meals)

    def score_meal(self, meal_name, risk_profile):
        """
        Health score for a meal (0-100) based on risk profile.
        """
        meal = next((m for m in self.meals if m["name"] == meal_name), None)
        if not meal:
            return 50
            
        score = 80 # Base score
        
        # Diabetes Risk (Low GI, High Fiber)
        if risk_profile.get("diabetes", 0) > 60:
            if meal["GI_index"] > 60: score -= 20
            if meal["GI_index"] < 50: score += 10
            if "Fiber" in meal["key_nutrients"]: score += 10
            
        # Heart Risk (Low Sodium/Fat, High Omega-3)
        if risk_profile.get("heart", 0) > 60:
            if meal["macros"]["fat"] > 15: score -= 15
            if "Omega-3" in meal["key_nutrients"]: score += 15
            if meal["calories"] > 500: score -= 10
            
        # Stroke Risk (Mediterranean, Potassium)
        if risk_profile.get("stroke", 0) > 60:
            if "Potassium" in meal["key_nutrients"]: score += 15
            if "Healthy Fats" in meal["key_nutrients"]: score += 10
            
        # Immunity (Vitamin C, Zinc) - for Dengue/Regional outbreaks
        if risk_profile.get("immunity_boost", 0) > 60:
            if "Vitamin C" in meal["key_nutrients"] or "Curcumin" in meal["key_nutrients"] or "Zinc" in meal["key_nutrients"]:
                score += 20

        return min(max(score, 0), 100)

    def nutritional_targets(self, risk_profile):
        """
        Daily calorie/macro targets based on risk profile.
        """
        targets = {
            "calories": 2000,
            "carbs_pct": 50,
            "protein_pct": 20,
            "fat_pct": 30
        }
        
        if risk_profile.get("diabetes", 0) > 60:
            targets["carbs_pct"] = 40
            targets["protein_pct"] = 30
            targets["calories"] = 1800
            
        if risk_profile.get("heart", 0) > 60:
            targets["fat_pct"] = 20
            targets["protein_pct"] = 25
            targets["carbs_pct"] = 55
            
        return targets

    def recommend_supplements(self, risk_profile):
        """
        Vitamin/mineral supplement list based on risk.
        """
        supplements = []
        
        if risk_profile.get("diabetes", 0) > 60:
            supplements.append({
                "name": "Alpha-Lipoic Acid",
                "reason": "Improves insulin sensitivity and nerve health.",
                "dosage": "300-600mg daily",
                "note": "Consult your doctor before starting."
            })
            supplements.append({
                "name": "Chromium Picolinate",
                "reason": "Assists in blood sugar regulation.",
                "dosage": "200mcg daily",
                "note": "Consult your doctor before starting."
            })
            
        if risk_profile.get("heart", 0) > 60:
            supplements.append({
                "name": "Omega-3 Fish Oil",
                "reason": "Reduces triglycerides and supports heart health.",
                "dosage": "1000mg daily",
                "note": "Consult your doctor before starting."
            })
            supplements.append({
                "name": "Coenzyme Q10 (CoQ10)",
                "reason": "Supports cardiac muscle energy production.",
                "dosage": "100mg daily",
                "note": "Consult your doctor before starting."
            })
            
        if risk_profile.get("stroke", 0) > 60:
            supplements.append({
                "name": "Magnesium Citrate",
                "reason": "Supports vascular health and BP regulation.",
                "dosage": "200-400mg daily",
                "note": "Consult your doctor before starting."
            })
            supplements.append({
                "name": "Vitamin B Complex",
                "reason": "Helps lower homocysteine levels.",
                "dosage": "One capsule daily",
                "note": "Consult your doctor before starting."
            })
            
        if not supplements:
            supplements.append({
                "name": "Multivitamin",
                "reason": "General nutritional support.",
                "dosage": "One daily",
                "note": "Consult your doctor before starting."
            })
            
        return supplements
