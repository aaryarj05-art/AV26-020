import httpx
import asyncio
import sys

async def test_endpoint(name, url, method="GET", json_data=None):
    async with httpx.AsyncClient() as client:
        try:
            if method == "GET":
                res = await client.get(url, timeout=5.0)
            else:
                res = await client.post(url, json=json_data, timeout=5.0)
            
            if res.status_code < 400:
                print(f"✅ {name}: PASS ({res.status_code})")
                return True
            else:
                print(f"❌ {name}: FAIL ({res.status_code})")
                return False
        except Exception as e:
            print(f"❌ {name}: FAIL (Connection Error: {str(e)})")
            return False

async def main():
    print("🚀 Running Helix Core Integration Test Suite...")
    print("-" * 50)
    
    tests = [
        ("Backend Health", "http://localhost:8000/health"),
        ("ML Service Health", "http://localhost:8001/health"),
        ("Dashboard Summary", "http://localhost:8000/api/dashboard/summary"),
        ("Outbreak Prediction", "http://localhost:8000/api/predictions/outbreak", "POST", {"disease": "Dengue", "region": "Maharashtra"}),
        ("Symptom Classify", "http://localhost:8000/api/symptoms/classify", "POST", {"symptoms": ["Fever", "Joint Pain"]}),
        ("Active Alerts", "http://localhost:8000/api/alerts/active"),
        ("Risk Assessment", "http://localhost:8000/api/personal/risk-assessment", "POST", {"profile": {"age": 45, "bmi": 28}}),
        ("Health Twin Sim", "http://localhost:8000/api/personal/health-twin/simulate", "POST", {"profile": {"age": 45, "bmi": 28}, "years": 5}),
        ("Wearables Ingest", "http://localhost:8000/api/wearables/ingest", "POST", {"device_id": "TEST_001", "heart_rate": 72, "spo2": 98.5, "steps": 5000, "sleep_hours": 7.0}),
        ("Latest Wearable", "http://localhost:8000/api/wearables/latest")
    ]
    
    results = []
    for test in tests:
        res = await test_endpoint(*test)
        results.append(res)
        
    passed = sum(results)
    total = len(results)
    score = (passed / total) * 100
    
    print("-" * 50)
    print(f"TOTAL SCORE: {score:.1f}% ({passed}/{total} Passed)")
    
    if score >= 85:
        print("✅ CORE FEATURES INTEGRATION SUCCESSFUL")
    else:
        print("⚠️ INTEGRATION WARNING: Review failed components before demo.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
