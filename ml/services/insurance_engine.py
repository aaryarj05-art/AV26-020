import math

class InsuranceEngine:
    def __init__(self):
        self.base_premium = 5000.0

    def compute_risk_premium(self, user_profile, region_risk_score):
        """
        Risk-based premium model:
        - Base premium: ₹5,000/year
        - Modifiers: age (+1% per year >30), BMI (overweight +10%, obese +25%)
        - Disease risk: diabetes risk% * 0.5 = premium add-on %
        - Regional outbreak risk: region_risk_score / 100 * 15% = area surcharge
        """
        age = user_profile.get("age", 30)
        bmi = user_profile.get("bmi", 22)
        diabetes_risk = user_profile.get("diabetes_risk", 0) # 0-100
        heart_risk = user_profile.get("heart_risk", 0)
        
        # 1. Age Modifier
        age_surcharge = 0
        if age > 30:
            age_surcharge = (age - 30) * 0.01 * self.base_premium
            
        # 2. BMI Modifier
        bmi_surcharge = 0
        if bmi >= 30:
            bmi_surcharge = self.base_premium * 0.25
        elif bmi >= 25:
            bmi_surcharge = self.base_premium * 0.10
            
        # 3. Disease Risk Modifier (Diabetes & Heart)
        # diabetes risk% * 0.5 = premium add-on %
        disease_loading = (diabetes_risk * 0.005 + heart_risk * 0.005) * self.base_premium
        
        # 4. Regional Area Surcharge
        # region_risk_score / 100 * 15% = area surcharge
        area_surcharge = (region_risk_score / 100.0) * 0.15 * self.base_premium
        
        total_premium = self.base_premium + age_surcharge + bmi_surcharge + disease_loading + area_surcharge
        
        # Risk Tiering
        risk_tier = "Standard"
        if total_premium > self.base_premium * 1.5: risk_tier = "High Risk"
        elif total_premium > self.base_premium * 1.2: risk_tier = "Elevated"
        
        return {
            "base_premium": round(self.base_premium, 2),
            "age_surcharge": round(age_surcharge, 2),
            "bmi_surcharge": round(bmi_surcharge, 2),
            "disease_loading": round(disease_loading, 2),
            "area_surcharge": round(area_surcharge, 2),
            "total_premium": round(total_premium, 2),
            "risk_tier": risk_tier,
            "currency": "INR"
        }

    def portfolio_risk_analysis(self, region, disease_risk_avg):
        """
        Aggregate risk for insurers covering a region.
        """
        # Mock calculation
        exposure = 100000000 # ₹10 Cr exposure in region
        expected_claims_pct = (disease_risk_avg / 100.0) * 0.05
        expected_payout = exposure * expected_claims_pct
        
        return {
            "region": region,
            "total_exposure": exposure,
            "expected_claims_ratio": round(expected_claims_pct * 100, 2),
            "expected_payout": round(expected_payout, 2),
            "reinsurance_trigger": disease_risk_avg > 80
        }

    def outbreak_liability_estimate(self, predicted_cases, avg_claim_cost=25000):
        """
        Estimated claims exposure based on outbreak prediction.
        """
        return {
            "predicted_claims": predicted_cases,
            "avg_claim_cost": avg_claim_cost,
            "estimated_liability": predicted_cases * avg_claim_cost
        }
