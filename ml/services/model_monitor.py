import json
import os
import time
from datetime import datetime, timedelta
import numpy as np

class ModelMonitor:
    def __init__(self, log_path="ml/data/performance_log.jsonl"):
        self.log_path = log_path
        self._ensure_log_exists()

    def _ensure_log_exists(self):
        if not os.path.exists(os.path.dirname(self.log_path)):
            os.makedirs(os.path.dirname(self.log_path), exist_ok=True)
        if not os.path.exists(self.log_path):
            with open(self.log_path, "w") as f:
                pass

    def track_prediction_accuracy(self, model_name, prediction, actual):
        """
        Compare prediction vs actual outcome and log it.
        """
        error = abs(prediction - actual)
        metrics = {
            "timestamp": datetime.utcnow().isoformat(),
            "model": model_name,
            "prediction": prediction,
            "actual": actual,
            "error": error
        }
        self.log_performance(model_name, metrics)
        return error

    def log_performance(self, model_name, metrics):
        with open(self.log_path, "a") as f:
            f.write(json.dumps(metrics) + "\n")

    def compute_drift(self, model_name, window_days=7):
        """
        Detect performance drift: check if RMSE is increasing over time.
        """
        logs = self.get_logs(model_name, window_days)
        if len(logs) < 10:
            return 0.0 # Not enough data for drift detection
            
        errors = [log["error"] for log in logs]
        rmse = np.sqrt(np.mean(np.square(errors)))
        
        # Simple drift score: current RMSE / baseline RMSE (mocked as 50)
        baseline_rmse = 50.0
        drift_score = rmse / baseline_rmse
        return round(min(drift_score, 1.0), 2)

    def compute_psi(self, expected, actual, buckets=10):
        """
        Population Stability Index (PSI) for input features.
        PSI = sum((Actual % - Expected %) * ln(Actual % / Expected %))
        """
        def scale_to_buckets(data, buckets):
            return np.histogram(data, bins=buckets)[0] / len(data)

        # Mocking PSI calculation for demonstration
        # In a real app, this would compare feature distributions
        return round(np.random.uniform(0.05, 0.25), 2)

    def should_retrain(self, model_name, last_trained_date=None, new_data_count=0):
        """
        Heuristic for retraining.
        """
        drift = self.compute_drift(model_name)
        psi = self.compute_psi(None, None) # Mocked
        
        # Reasons to retrain
        reasons = []
        if drift > 0.8: reasons.append(f"High Performance Drift ({drift})")
        if psi > 0.2: reasons.append(f"Significant Distribution Shift (PSI: {psi})")
        
        if last_trained_date:
            days_since = (datetime.utcnow() - last_trained_date).days
            if days_since > 7: reasons.append(f"Stale Model ({days_since} days old)")
            
        if new_data_count > 500:
            reasons.append(f"Large Data Influx ({new_data_count} new records)")
            
        return len(reasons) > 0, reasons

    def get_logs(self, model_name=None, days=30):
        logs = []
        cutoff = datetime.utcnow() - timedelta(days=days)
        if not os.path.exists(self.log_path):
            return []
            
        with open(self.log_path, "r") as f:
            for line in f:
                try:
                    log = json.loads(line)
                    if model_name and log["model"] != model_name:
                        continue
                    if datetime.fromisoformat(log["timestamp"]) < cutoff:
                        continue
                    logs.append(log)
                except:
                    continue
        return logs
