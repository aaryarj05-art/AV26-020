from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import logging

class LearningScheduler:
    def __init__(self, monitor, retrainer):
        self.monitor = monitor
        self.retrainer = retrainer
        self.scheduler = BackgroundScheduler()
        self.logger = logging.getLogger("helix-scheduler")

    def start(self):
        # Every 6 hours: Check and retrain due models
        self.scheduler.add_job(
            self.check_and_retrain, 
            'interval', 
            hours=6,
            id='retrain_job'
        )
        
        # Every 1 hour: Track drift for all models
        self.scheduler.add_job(
            self.monitor_drift, 
            'interval', 
            hours=1,
            id='drift_job'
        )
        
        self.scheduler.start()
        self.logger.info("Continuous Learning Scheduler started.")

    def check_and_retrain(self):
        self.logger.info("Checking for models due for retraining...")
        # Mock status for models
        models = [
            {"name": "Dengue LSTM", "last_trained": "2026-05-01T00:00:00"},
            {"name": "Malaria Prophet", "last_trained": "2026-05-08T00:00:00"},
            {"name": "Stroke Guard", "last_trained": "2026-05-10T00:00:00"}
        ]
        results = self.retrainer.retrain_all_due(models)
        self.logger.info(f"Retraining cycle complete. Models updated: {len(results)}")

    def monitor_drift(self):
        self.logger.info("Computing drift scores for all active models...")
        # In a real app, this would update a drift dashboard or send alerts
        models = ["Dengue LSTM", "Malaria Prophet", "Influenza ARIMA", "Stroke Guard"]
        for m in models:
            drift = self.monitor.compute_drift(m)
            if drift > 0.7:
                self.logger.warning(f"Drift detected in {m}: {drift}")

    def shutdown(self):
        self.scheduler.shutdown()
