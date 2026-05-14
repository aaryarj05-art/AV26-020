import random
from services.facial_analysis import FacialAnalysisEngine
from services.speech_analysis import SpeechAnalysisEngine

class StrokeGuardEngine:
    def __init__(self):
        self.facial_engine = FacialAnalysisEngine()
        self.speech_engine = SpeechAnalysisEngine()

    def assess_neurological_risk(self, health_data: dict, stroke_model_output: dict):
        """Legacy method for backward compatibility"""
        return self.full_assessment(health_data, stroke_model_output)

    def full_assessment(self, health_data: dict, stroke_model_output: dict, image_bytes: bytes = None, speech_text: str = None):
        """
        Combines ML risk with real-time CV and NLP inputs.
        Weights: ML (40%), Facial (30%), Speech (20%), Vitals (10%)
        """
        model_risk = stroke_model_output.get('risk_probability', 0)
        bp = health_data.get('bp_systolic', 120)
        
        # 1. ML Historical Risk (40%)
        risk_score = model_risk * 0.40
        
        # 2. Facial Asymmetry (30%)
        if image_bytes:
            face_results = self.facial_engine.analyze_image(image_bytes)
            # Normalize 0-100 score to 0-1
            face_risk = face_results['asymmetry_score'] / 100.0
            face_status = face_results['risk_level']
            fast_flags = face_results.get('flags', [])
        else:
            # Fallback if no image provided
            face_risk = 0.05
            face_status = "Not Analyzed"
            fast_flags = []
            
        risk_score += face_risk * 0.30
        
        # 3. Speech Fluency (20%)
        if speech_text:
            speech_results = self.speech_engine.analyze_text_input(speech_text)
            # Invert fluency (high fluency = low risk)
            speech_risk = (100 - speech_results['fluency_score']) / 100.0
            speech_status = speech_results['risk_level']
            if "Speech (S of FAST)" in speech_results.get('confusion_indicators', []):
                fast_flags.append("Speech (S of FAST)")
        else:
            speech_risk = 0.05
            speech_status = "Not Analyzed"
            
        risk_score += speech_risk * 0.20
        
        # 4. Vitals/BP (10%)
        vitals_risk = 0
        if bp > 180: vitals_risk = 1.0
        elif bp > 160: vitals_risk = 0.7
        elif bp > 140: vitals_risk = 0.4
        risk_score += vitals_risk * 0.10
        
        # Final Categorization
        risk_score = min(0.99, risk_score)
        level = "Low"
        if risk_score > 0.6: level = "Critical"
        elif risk_score > 0.35: level = "High"
        elif risk_score > 0.15: level = "Moderate"
        
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
                "ml_baseline_risk": f"{round(model_risk * 100, 1)}%",
                "facial_symmetry": face_status,
                "speech_coherence": speech_status,
                "blood_pressure_status": "Hypertensive Crisis" if bp > 180 else ("Hypertensive" if bp > 140 else "Normal")
            },
            "fast_flags": fast_flags
        }
