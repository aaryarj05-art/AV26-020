import numpy as np

class HealthTwin:
    def __init__(self, user_profile: dict):
        self.profile = user_profile
        self.current_age = user_profile.get('age', 35)

    def run_simulation(self, years=5, interventions=None):
        """
        Projects health trajectory over a number of years.
        interventions: dict of changes (e.g. {'lose_weight': 5, 'quit_smoking': True})
        """
        trajectory = []
        
        # Base risk calculation (mocked based on profile)
        base_diabetes = 0.15 + (self.profile.get('bmi', 25) - 22) * 0.02
        base_heart = 0.10 + (self.profile.get('bp_systolic', 120) - 110) * 0.01
        base_stroke = 0.05 + (self.profile.get('age', 35) - 20) * 0.005
        
        # Apply interventions
        if interventions:
            if 'weight_loss' in interventions:
                loss = interventions['weight_loss']
                base_diabetes -= loss * 0.015
                base_heart -= loss * 0.01
            if 'quit_smoking' in interventions and interventions['quit_smoking']:
                base_stroke *= 0.7
                base_heart *= 0.8
            if 'exercise' in interventions:
                hours = interventions['exercise']
                base_diabetes -= hours * 0.01
                base_heart -= hours * 0.02
                base_stroke -= hours * 0.01
        
        # Clamp risks
        base_diabetes = max(0.01, min(0.95, base_diabetes))
        base_heart = max(0.01, min(0.95, base_heart))
        base_stroke = max(0.01, min(0.95, base_stroke))
        
        for year in range(years + 1):
            # Age effect: risk increases naturally over time
            age_factor = 1 + (year * 0.03)
            
            trajectory.append({
                "year": 2026 + year,
                "diabetes": round(min(0.99, base_diabetes * age_factor), 3),
                "heart": round(min(0.99, base_heart * age_factor), 3),
                "stroke": round(min(0.99, base_stroke * age_factor), 3)
            })
            
        return trajectory

    def get_potential_reduction(self, intervention_type, value):
        """
        Returns % reduction for a specific intervention
        """
        baseline = self.run_simulation(years=0)[0]
        improved = self.run_simulation(years=0, interventions={intervention_type: value})[0]
        
        # Calculate reduction in highest risk condition
        conditions = ['diabetes', 'heart', 'stroke']
        max_cond = max(conditions, key=lambda c: baseline[c])
        
        reduction = (baseline[max_cond] - improved[max_cond]) / baseline[max_cond] * 100
        return round(reduction, 1)
