import json
import httpx
import asyncio
from datetime import datetime, timedelta

async def seed():
    print("🌱 Seeding Helix Demo Data...")
    
    # 1. Symptom Reports
    print("  -> Seeding Symptom Reports...")
    async with httpx.AsyncClient() as client:
        for _ in range(20):
            await client.post("http://localhost:8000/api/symptoms/report", json={
                "region": "Maharashtra",
                "symptoms": ["Fever", "Headache"],
                "severity": 3,
                "age_group": "adult"
            })
            
    # 2. Simulation Alerts (will be done via the API if it exists or manually in DB)
    # Since we have an endpoint for simulation trigger:
    print("  -> Seeding Simulation Alerts...")
    async with httpx.AsyncClient() as client:
        await client.post("http://localhost:8000/api/alerts/simulate", params={"severity": "CRITICAL", "region": "Maharashtra"})
        await client.post("http://localhost:8000/api/alerts/simulate", params={"severity": "HIGH", "region": "Delhi"})
        
    # 3. Wearable Data
    print("  -> Seeding Wearable Telemetry...")
    async with httpx.AsyncClient() as client:
        for i in range(24):
            await client.post("http://localhost:8000/api/wearables/ingest", json={
                "device_id": "HELIX_WATCH_01",
                "heart_rate": 70 + (i % 5),
                "spo2": 98.0 + (i % 2),
                "steps": 1000 * i,
                "sleep_hours": 7.5
            })

    print("✅ Demo data seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed())
