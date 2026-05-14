import random

class DrugDiscoveryEngine:
    def __init__(self):
        self.protocols = {
            "Dengue": {
                "Standard Supportive": {"efficacy": 75, "side_effects": 0.05, "recovery_days": 7},
                "Aggressive Hydration": {"efficacy": 82, "side_effects": 0.08, "recovery_days": 6},
                "Anti-Viral Candidate Alpha": {"efficacy": 91, "side_effects": 0.12, "recovery_days": 4}
            },
            "Malaria": {
                "Standard ACT": {"efficacy": 92, "side_effects": 0.15, "recovery_days": 5},
                "Triple Artemisinin Therapy": {"efficacy": 97, "side_effects": 0.18, "recovery_days": 3},
                "Experimental Vaccine Boost": {"efficacy": 99, "side_effects": 0.05, "recovery_days": 14}
            },
            "Influenza": {
                "Oseltamivir Standard": {"efficacy": 85, "side_effects": 0.10, "recovery_days": 5},
                "Next-Gen Viral Inhibitor": {"efficacy": 94, "side_effects": 0.08, "recovery_days": 3}
            }
        }

    def simulate_treatment(self, disease, protocol_params):
        """
        Simulates efficacy and recovery for a protocol.
        """
        drug_class = protocol_params.get("drug_class", "Standard")
        dosage = protocol_params.get("dosage", 500)
        
        # Base stats from protocol library or random if new
        base = self.protocols.get(disease, {}).get(drug_class, {
            "efficacy": random.randint(60, 90),
            "side_effects": random.uniform(0.05, 0.2),
            "recovery_days": random.randint(5, 10)
        })
        
        # Dosage modifier (simple model: higher dosage = better efficacy but higher side effects)
        dosage_mod = dosage / 500.0
        efficacy = min(base["efficacy"] * (0.9 + 0.1 * dosage_mod), 99.0)
        side_effects = min(base["side_effects"] * dosage_mod, 0.5)
        recovery = max(base["recovery_days"] * (1.1 - 0.1 * dosage_mod), 1.0)
        
        return {
            "disease": disease,
            "drug_class": drug_class,
            "efficacy_pct": round(efficacy, 2),
            "side_effect_prob": round(side_effects, 4),
            "time_to_recovery": round(recovery, 1),
            "confidence_score": 0.94
        }

    def population_impact(self, disease, predicted_cases, efficacy_pct):
        """
        Estimates lives saved if protocol deployed.
        """
        mortality_rates = {"Dengue": 0.01, "Malaria": 0.02, "Influenza": 0.005, "Stroke": 0.15}
        base_mortality = mortality_rates.get(disease, 0.01)
        
        # Efficacy reduces mortality by a fraction
        mortality_reduction = efficacy_pct / 100.0 * 0.8 # 80% of efficacy translates to mortality drop
        new_mortality = base_mortality * (1 - mortality_reduction)
        
        lives_saved = int(predicted_cases * (base_mortality - new_mortality))
        
        return {
            "cases_treated": predicted_cases,
            "lives_saved": max(lives_saved, 0),
            "recovery_days_saved": int(predicted_cases * 2.5) # Mock: 2.5 days saved per person
        }
