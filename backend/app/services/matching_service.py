def match_doctor(risk_profile, symptoms):
    """
    AI Recommendation logic:
    - High stroke risk -> Neurologist
    - High heart risk -> Cardiologist
    - Dengue/Fever symptoms -> General Physician
    - High AQI + respiratory symptoms -> Pulmonologist
    """
    recommendations = []
    
    # Check Risk Scores
    if risk_profile.get("stroke_risk", 0) > 60:
        recommendations.append({
            "specialization": "Neurologist",
            "reason": "Elevated neuro-vascular risk markers detected."
        })
        
    if risk_profile.get("heart_risk", 0) > 60:
        recommendations.append({
            "specialization": "Cardiologist",
            "reason": "Cardiac telemetry indicates potential cardiovascular strain."
        })

    # Check Symptoms (substring match)
    symptoms_str = symptoms.lower() if symptoms else ""
    
    if "fever" in symptoms_str or "rash" in symptoms_str or "headache" in symptoms_str:
        recommendations.append({
            "specialization": "General Physician",
            "reason": "Symptom cluster suggests acute viral or seasonal infection."
        })
        
    if "cough" in symptoms_str or "breath" in symptoms_str or "chest" in symptoms_str:
        recommendations.append({
            "specialization": "Pulmonologist",
            "reason": "Respiratory distress markers or cough reported."
        })

    # Default fallback
    if not recommendations:
        recommendations.append({
            "specialization": "General Physician",
            "reason": "Initial baseline assessment recommended for reported symptoms."
        })
        
    return recommendations
