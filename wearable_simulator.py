import httpx
import time
import random
import asyncio

async def simulate():
    print("⌚ Wearable Telemetry Simulator Started...")
    print("Press Ctrl+C to stop.")
    
    device_id = "HELIX_WATCH_01"
    
    async with httpx.AsyncClient() as client:
        while True:
            try:
                data = {
                    "device_id": device_id,
                    "heart_rate": random.randint(65, 95),
                    "spo2": round(random.uniform(96.0, 99.8), 1),
                    "steps": random.randint(3000, 12000),
                    "sleep_hours": round(random.uniform(6.0, 8.5), 1)
                }
                
                res = await client.post("http://localhost:8000/api/wearables/ingest", json=data)
                if res.status_code == 200:
                    print(f"[{time.strftime('%H:%M:%S')}] Pushed telemetry: HR={data['heart_rate']} SpO2={data['spo2']}%")
                else:
                    print(f"Error pushing data: {res.status_code}")
                    
            except Exception as e:
                print(f"Connection error: {e}")
                
            await asyncio.sleep(10) # Post every 10 seconds

if __name__ == "__main__":
    try:
        asyncio.run(simulate())
    except KeyboardInterrupt:
        print("\nSimulator stopped.")
