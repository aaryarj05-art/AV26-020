import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models.models import AlertLog, UserSymptomReport

def seed_final():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    print("Initializing Final Demo Seed...")
    
    # 1. Create Active Alerts
    alerts = [
        AlertLog(region="Maharashtra", disease="Dengue", severity="CRITICAL", message="Severe spike in fever symptoms detected in Mumbai clusters. Immediate resource mobilization advised.", is_active=True),
        AlertLog(region="Kerala", disease="Malaria", severity="CRITICAL", message="Anomaly detected in monsoon-driven malaria vectors. Prediction confidence 94%.", is_active=True),
        AlertLog(region="Delhi", disease="Influenza", severity="HIGH", message="Rising respiratory distress reports across NCR region.", is_active=True),
        AlertLog(region="Karnataka", disease="Cholera", severity="MEDIUM", message="Water-borne pathogen alerts triggered by recent rainfall data.", is_active=True),
        AlertLog(region="Tamil Nadu", disease="Dengue", severity="MEDIUM", message="Early-stage clusters detected in Chennai suburbs.", is_active=True)
    ]
    for a in alerts: db.add(a)

    # 2. Symptom Reports (500 scattered across regions)
    regions = ["Maharashtra", "Kerala", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "West Bengal", "Rajasthan"]
    symptoms = ["fever", "cough", "fatigue", "rash", "headache", "chills", "nausea"]
    for _ in range(500):
        report = UserSymptomReport(
            region=random.choice(regions),
            symptoms=",".join(random.sample(symptoms, random.randint(1, 3))),
            severity=random.randint(1, 3),
            age_group=random.choice(["child", "adult", "senior"]),
            timestamp=datetime.utcnow() - timedelta(hours=random.randint(0, 72))
        )
        db.add(report)

    # 5. Performance Log (Simulated for Learning Center)
    # This is a jsonl file, not in DB. We can mock it in ml/main.py logic or create the file.
    os.makedirs("ml/data", exist_ok=True)
    with open("ml/data/performance_log.jsonl", "w") as f:
        models = ["Dengue LSTM", "Malaria Prophet", "Influenza ARIMA", "Stroke Guard"]
        for _ in range(100):
            import json
            log = {
                "timestamp": (datetime.utcnow() - timedelta(hours=random.randint(0, 500))).isoformat(),
                "model": random.choice(models),
                "prediction": random.uniform(40, 60),
                "actual": random.uniform(35, 65),
                "error": random.uniform(1, 10)
            }
            f.write(json.dumps(log) + "\n")

    db.commit()
    db.close()
    print("✅ Final Demo Seed Complete. Helix is ready for judges.")

if __name__ == "__main__":
    seed_final()
