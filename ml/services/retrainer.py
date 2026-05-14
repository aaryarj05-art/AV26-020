import time
import random
from datetime import datetime
import os
import json

class Retrainer:
    def __init__(self, monitor):
        self.monitor = monitor
        self.improvement_log = "ml/data/improvements.json"
        self._ensure_log_exists()

    def _ensure_log_exists(self):
        if not os.path.exists(self.improvement_log):
            with open(self.improvement_log, "w") as f:
                json.dump([], f)

    def retrain_model(self, model_name, reason):
        """
        Mock retraining logic. In a real app, this would call 
        train_all.py or a specific trainer.
        """
        print(f"Starting retraining for {model_name}. Reason: {reason}")
        
        # Simulate training time
        time.sleep(2)
        
        # Simulate performance comparison
        old_rmse = random.uniform(40, 60)
        new_rmse = old_rmse * random.uniform(0.85, 1.1) # 15% better or 10% worse
        
        improvement_pct = ((old_rmse - new_rmse) / old_rmse) * 100
        
        result = {
            "timestamp": datetime.utcnow().isoformat(),
            "model": model_name,
            "reason": reason,
            "old_rmse": round(old_rmse, 2),
            "new_rmse": round(new_rmse, 2),
            "improvement_pct": round(improvement_pct, 2),
            "status": "Accepted" if improvement_pct > 5 else "Rejected"
        }
        
        if result["status"] == "Accepted":
            self._log_improvement(result)
            # In real app: os.rename("new_model.pkl", "prod_model.pkl")
            
        return result

    def _log_improvement(self, result):
        with open(self.improvement_log, "r") as f:
            data = json.load(f)
        data.append(result)
        with open(self.improvement_log, "w") as f:
            json.dump(data, f, indent=2)

    def retrain_all_due(self, models_status):
        results = []
        for model in models_status:
            should, reasons = self.monitor.should_retrain(
                model["name"], 
                datetime.fromisoformat(model["last_trained"]),
                random.randint(0, 1000) # Mock new data count
            )
            if should:
                res = self.retrain_model(model["name"], ", ".join(reasons))
                results.append(res)
        return results

    def run_ab_test(self, model_name, window_days=3):
        """
        Runs a shadow test between Champion (Prod) and Challenger (New).
        """
        return {
            "model": model_name,
            "champion_rmse": random.uniform(45, 50),
            "challenger_rmse": random.uniform(42, 48),
            "winner": "Challenger" if random.random() > 0.5 else "Champion"
        }
