"""
ml/services/cluster_symptoms.py

SymptomClusteringService — combines user reports + WHO outbreaks
to produce KMeans-based cluster summaries and Z-score spike detection.
"""

import numpy as np
from typing import List, Dict, Optional
from sklearn.cluster import KMeans
from sklearn.preprocessing import MultiLabelBinarizer

KNOWN_SYMPTOMS = [
    "Fever", "Cough", "Sore Throat", "Runny Nose", "Fatigue",
    "Joint Pain", "Rash", "Nausea", "Chills", "Sweating",
    "Headache", "Diarrhea", "Vomiting", "Abdominal Cramps",
    "Shortness of Breath", "Loss of Taste", "Loss of Smell",
    "Body Ache", "Dizziness", "Loss of Appetite",
]

DISEASE_SYMPTOM_KEYWORDS: Dict[str, List[str]] = {
    "Dengue":    ["fever", "joint pain", "rash", "nausea"],
    "Malaria":   ["fever", "chills", "sweating", "headache"],
    "Cholera":   ["diarrhea", "vomiting", "abdominal cramps"],
    "Influenza": ["fever", "cough", "sore throat", "runny nose", "fatigue"],
    "COVID":     ["fever", "cough", "shortness of breath", "loss of taste", "loss of smell"],
    "Mpox":      ["rash", "fever", "headache", "body ache"],
}


class SymptomClusteringService:

    def __init__(self):
        self.mlb = MultiLabelBinarizer(classes=KNOWN_SYMPTOMS)
        # Fit with the full vocabulary so transform always produces consistent vectors
        self.mlb.fit([[s] for s in KNOWN_SYMPTOMS])

    # ------------------------------------------------------------------ #
    # Feature matrix
    # ------------------------------------------------------------------ #

    def build_feature_matrix(self, reports: List[Dict]) -> np.ndarray:
        """
        Convert a list of report dicts (each with a 'symptoms' key containing
        a list of symptom strings) into a binary feature matrix.
        """
        symptom_lists = []
        for r in reports:
            raw = r.get("symptoms", [])
            # symptoms may arrive as JSON string or list
            if isinstance(raw, str):
                import json
                try:
                    raw = json.loads(raw)
                except Exception:
                    raw = []
            symptom_lists.append([s for s in raw if s in KNOWN_SYMPTOMS])
        return self.mlb.transform(symptom_lists)

    # ------------------------------------------------------------------ #
    # KMeans
    # ------------------------------------------------------------------ #

    def run_kmeans(self, feature_matrix: np.ndarray, n_clusters: int = 5) -> np.ndarray:
        """Run KMeans and return per-row cluster labels."""
        if len(feature_matrix) == 0:
            return np.array([], dtype=int)
        actual_k = min(n_clusters, len(feature_matrix))
        km = KMeans(n_clusters=actual_k, random_state=42, n_init=10)
        return km.fit_predict(feature_matrix)

    # ------------------------------------------------------------------ #
    # Spike detection
    # ------------------------------------------------------------------ #

    def detect_spikes(self, region_daily_counts: Dict[str, Dict[str, int]]) -> List[Dict]:
        """
        Z-score spike detection per region.

        region_daily_counts: { "Mumbai": {"2024-10-01": 12, "2024-10-02": 45, ...}, ... }
        Returns a list of { region, date, zscore, is_spike }.
        """
        results = []
        for region, daily in region_daily_counts.items():
            if len(daily) < 3:
                continue
            dates = sorted(daily.keys())
            counts = np.array([daily[d] for d in dates], dtype=float)
            mean = counts.mean()
            std = counts.std()
            if std == 0:
                continue
            for date, count in zip(dates, counts):
                z = float((count - mean) / std)
                results.append({
                    "region": region,
                    "date": date,
                    "zscore": round(z, 2),
                    "is_spike": z > 2.0,
                })
        return results

    # ------------------------------------------------------------------ #
    # WHO corroboration
    # ------------------------------------------------------------------ #

    def _who_corroborates(
        self,
        dominant_symptoms: List[str],
        regions: List[str],
        who_outbreaks: List[Dict],
    ) -> bool:
        """
        Return True if any WHO outbreak disease matches the cluster's dominant
        symptoms AND overlaps geographically (loose string match).
        """
        for outbreak in who_outbreaks:
            disease = outbreak.get("disease", "")
            outbreak_region = (outbreak.get("region") or "").lower()
            keywords = DISEASE_SYMPTOM_KEYWORDS.get(disease, [])
            symptom_match = any(
                kw in s.lower() for kw in keywords for s in dominant_symptoms
            )
            region_match = any(outbreak_region in r.lower() or r.lower() in outbreak_region for r in regions)
            if symptom_match and region_match:
                return True
        return False

    # ------------------------------------------------------------------ #
    # Main entry point
    # ------------------------------------------------------------------ #

    def get_cluster_summary(
        self,
        reports: List[Dict],
        who_outbreaks: List[Dict],
    ) -> List[Dict]:
        """
        Combine user report symptom vectors + WHO outbreak keywords,
        run KMeans, return structured cluster summaries.
        """
        if not reports:
            return []

        X = self.build_feature_matrix(reports)
        if X.shape[0] == 0:
            return []

        labels = self.run_kmeans(X)
        clusters: Dict[int, Dict] = {}

        for idx, label in enumerate(labels):
            label = int(label)
            report = reports[idx]
            if label not in clusters:
                clusters[label] = {
                    "symptom_vectors": [],
                    "regions": [],
                    "count": 0,
                }
            clusters[label]["symptom_vectors"].append(X[idx])
            region = report.get("region", "Unknown")
            clusters[label]["regions"].append(region)
            clusters[label]["count"] += 1

        summaries = []
        for cluster_id, data in clusters.items():
            # Dominant symptoms = columns with highest mean activation
            if data["symptom_vectors"]:
                mean_vec = np.mean(data["symptom_vectors"], axis=0)
                top_indices = np.argsort(mean_vec)[::-1][:4]
                dominant = [KNOWN_SYMPTOMS[i] for i in top_indices if mean_vec[i] > 0]
            else:
                dominant = []

            unique_regions = list(set(data["regions"]))
            outbreak_conf = round(float(min(len(dominant) / 4.0, 1.0)) * 0.85, 2)
            corroborated = self._who_corroborates(dominant, unique_regions, who_outbreaks)

            summaries.append({
                "cluster_id": cluster_id,
                "dominant_symptoms": dominant,
                "report_count": data["count"],
                "regions": unique_regions,
                "outbreak_confidence": outbreak_conf,
                "who_corroboration": corroborated,
            })

        # Sort by confidence descending
        summaries.sort(key=lambda x: x["outbreak_confidence"], reverse=True)
        return summaries
