import random

class StrokeGuardEngine:
    def assess_neurological_risk(self, health_data: dict, stroke_model_output: dict):
        """
        Combines model risk with real-time vitals and placeholders for CV/NLP.
        """
        model_risk = stroke_model_output.get('risk_probability', 0)
        bp = health_data.get('bp_systolic', 120)
        
        # Risk Multipliers
        risk_score = model_risk * 0.6 # 60% weight from historical model
        
        # BP Factor
        if bp > 160: risk_score += 0.3
        elif bp > 140: risk_score += 0.15
        
        # Placeholders for Phase 14 Computer Vision & NLP
        # Facial Asymmetry (CV) - Mocked for now
        facial_asymmetry_score = random.uniform(0, 0.2) 
        risk_score += facial_asymmetry_score * 0.1
        
        # Speech Slurring (NLP) - Mocked for now
        speech_slurring_score = random.uniform(0, 0.1)
        risk_score += speech_slurring_score * 0.1
        
        # Final Categorization
        risk_score = min(0.99, risk_score)
        level = "Low"
        if risk_score > 0.7: level = "Critical"
        elif risk_score > 0.4: level = "High"
        elif risk_score > 0.2: level = "Moderate"
        
        actions = {
            "Critical": "EMERGENCY: Immediate clinical evaluation required. Possible neurological event.",
            "High": "Urgent: Consult neurologist within 24 hours. Monitor for BE-FAST symptoms.",
            "Moderate": "Monitor vitals closely. Review BP medication adherence.",
            "Low": "Maintain current monitoring protocol."
        }
        
        return {
            "neurological_risk_score": round(float(risk_score), 3),
            "risk_level": level,
            "recommendation": actions[level],
            "indicators": {
                "facial_symmetry": "Normal (Mock)",
                "speech_coherence": "High (Mock)",
                "blood_pressure_status": "Hypertensive" if bp > 140 else "Normal"
            }
        }
