import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import MultiLabelBinarizer
from datetime import datetime, timedelta

SYMPTOMS_LIST = [
    "Fever", "Cough", "Sore Throat", "Runny Nose", "Fatigue",
    "Joint Pain", "Rash", "Nausea", "Chills", "Sweating",
    "Headache", "Diarrhea", "Vomiting", "Abdominal Cramps",
    "Shortness of Breath", "Loss of Taste", "Loss of Smell",
    "Body Ache", "Dizziness", "Loss of Appetite"
]

DISEASE_RULES = {
    "Dengue": ["Fever", "Joint Pain", "Rash", "Nausea"],
    "Malaria": ["Fever", "Chills", "Sweating", "Headache"],
    "Cholera": ["Diarrhea", "Vomiting", "Abdominal Cramps"],
    "Influenza": ["Fever", "Cough", "Sore Throat", "Runny Nose", "Fatigue"],
    "COVID-19": ["Fever", "Cough", "Shortness of Breath", "Loss of Taste", "Loss of Smell"]
}

class SymptomClusteringEngine:
    def __init__(self):
        self.mlb = MultiLabelBinarizer(classes=SYMPTOMS_LIST)

    def preprocess_symptoms(self, symptoms_data):
        """Convert list of symptom lists to feature vectors"""
        if not symptoms_data:
            return np.array([])
        return self.mlb.fit_transform(symptoms_data)

    def classify_disease(self, symptoms):
        """Rule-based classification with confidence score"""
        scores = {}
        for disease, indicators in DISEASE_RULES.items():
            match_count = len(set(symptoms) & set(indicators))
            # Weight matches by importance (simplified)
            score = match_count / len(indicators)
            scores[disease] = score
            
        best_disease = max(scores, key=scores.get)
        confidence = scores[best_disease]
        
        # Risk level logic
        risk_level = "low"
        if confidence > 0.7: risk_level = "critical"
        elif confidence > 0.5: risk_level = "high"
        elif confidence > 0.3: risk_level = "medium"
        
        return {
            "disease": best_disease,
            "confidence": round(float(confidence), 2),
            "risk_level": risk_level
        }

    def detect_clusters(self, region, reports):
        """
        DBSCAN clustering on symptom vectors to find groups of similar cases
        reports: list of dicts with 'symptoms'
        """
        if not reports or len(reports) < 5:
            return []
            
        symptoms_list = [r['symptoms'] for r in reports]
        X = self.preprocess_symptoms(symptoms_list)
        
        # eps=1 (at least 2 symptoms different), min_samples=3
        clustering = DBSCAN(eps=1, min_samples=3).fit(X)
        
        # Group reports by cluster ID
        clusters = {}
        for idx, label in enumerate(clustering.labels_):
            if label == -1: continue # Noise
            if label not in clusters: clusters[label] = []
            clusters[label].append(reports[idx])
            
        return [
            {
                "cluster_id": int(k),
                "size": len(v),
                "common_symptoms": self._get_common_symptoms([r['symptoms'] for r in v])
            } for k, v in clusters.items()
        ]

    def _get_common_symptoms(self, symptoms_lists):
        from collections import Counter
        all_symptoms = [s for sublist in symptoms_lists for s in sublist]
        counts = Counter(all_symptoms)
        # Return symptoms that appear in >50% of reports in cluster
        return [s for s, count in counts.items() if count > len(symptoms_lists) / 2]

    def detect_spike(self, historical_counts, current_count):
        """Z-score based spike detection"""
        if not historical_counts or len(historical_counts) < 7:
            return {"is_spike": False, "z_score": 0}
            
        mean = np.mean(historical_counts)
        std = np.std(historical_counts)
        
        if std == 0: return {"is_spike": False, "z_score": 0}
        
        z_score = (current_count - mean) / std
        return {
            "is_spike": z_score > 2.0,
            "z_score": round(float(z_score), 2)
        }

    def get_regional_heatmap_data(self, regions, all_reports):
        # Placeholder for complex heatmapping
        data = []
        for region in regions:
            regional_reports = [r for r in all_reports if r['region'] == region]
            if not regional_reports:
                data.append({"region": region, "risk_score": 0, "dominant_symptom": "None", "case_estimate": 0})
                continue
                
            # Dominant symptom
            from collections import Counter
            all_symptoms = [s for r in regional_reports for s in r['symptoms']]
            dominant = Counter(all_symptoms).most_common(1)[0][0] if all_symptoms else "None"
            
            data.append({
                "region": region,
                "risk_score": min(len(regional_reports) * 5, 100),
                "dominant_symptom": dominant,
                "case_estimate": len(regional_reports) * 10 # heuristic multiplier
            })
        return data
