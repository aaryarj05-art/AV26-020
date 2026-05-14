import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models.models import Alert, SymptomReport, HealthPassport, Appointment, Doctor, MoodLog

def seed_final():
    db = SessionLocal()
    
    print("🚀 Initializing Final Demo Seed...")
    
    # 1. Create Active Alerts
    alerts = [
        Alert(region="Maharashtra", disease="Dengue", severity="CRITICAL", message="Severe spike in fever symptoms detected in Mumbai clusters. Immediate resource mobilization advised.", is_read=False),
        Alert(region="Kerala", disease="Malaria", severity="CRITICAL", message="Anomaly detected in monsoon-driven malaria vectors. Prediction confidence 94%.", is_read=False),
        Alert(region="Delhi", disease="Influenza", severity="HIGH", message="Rising respiratory distress reports across NCR region.", is_read=False),
        Alert(region="Karnataka", disease="Cholera", severity="MEDIUM", message="Water-borne pathogen alerts triggered by recent rainfall data.", is_read=False),
        Alert(region="Tamil Nadu", disease="Dengue", severity="MEDIUM", message="Early-stage clusters detected in Chennai suburbs.", is_read=False)
    ]
    for a in alerts: db.add(a)

    # 2. Symptom Reports (500 scattered across regions)
    regions = ["Maharashtra", "Kerala", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "West Bengal", "Rajasthan"]
    symptoms = ["fever", "cough", "fatigue", "rash", "headache", "chills", "nausea"]
    for _ in range(500):
        report = SymptomReport(
            region=random.choice(regions),
            symptoms=",".join(random.sample(symptoms, random.randint(1, 3))),
            severity=random.choice(["low", "medium", "high"]),
            age_group=random.choice(["child", "adult", "senior"]),
            timestamp=datetime.utcnow() - timedelta(hours=random.randint(0, 72))
        )
        db.add(report)

    # 3. Appointments
    doctors = db.query(Doctor).all()
    if doctors:
        for _ in range(10):
            apt = Appointment(
                doctor_id=random.choice(doctors).id,
                user_name="Demo User",
                user_email="demo@helix.ai",
                appointment_date=datetime.utcnow().date() + timedelta(days=random.randint(1, 5)),
                time_slot=random.choice(["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]),
                status="Confirmed"
            )
            db.add(apt)

    # 4. Mood Logs (30 days)
    for i in range(30):
        log = MoodLog(
            user_session_id="demo_user",
            mood_score=random.randint(4, 9),
            stress_score=random.randint(2, 8),
            notes="Daily check-in during simulation.",
            timestamp=datetime.utcnow() - timedelta(days=i)
        )
        db.add(log)

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
