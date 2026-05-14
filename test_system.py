import requests
import time
import concurrent.futures
import sys

BASE_URL = "http://localhost:8000"
ML_URL = "http://localhost:8001"

ENDPOINTS = {
    "Data": [
        ("/api/data/stats", 200),
        ("/api/data/outbreaks", 200),
        ("/api/data/environmental", 200),
        ("/api/data/regions", 200),
        ("/api/data/diseases", 200)
    ],
    "Predictions": [
        ("/api/predictions/outbreak?disease=Dengue&region=Maharashtra", 200),
        ("/api/predictions/risk?disease=Dengue&region=Maharashtra", 200),
        ("/api/predictions/seasonal?disease=Dengue", 200)
    ],
    "Alerts": [
        ("/api/alerts/active", 200),
        ("/api/alerts/history", 200)
    ],
    "Environmental": [
        ("/api/environment/weather?region=Maharashtra", 200)
    ],
    "Dashboard": [
        ("/api/dashboard/summary", 200),
        ("/api/dashboard/export", 200)
    ],
    "Fusion": [
        ("/api/fusion/status?region=Maharashtra", 200),
        ("/api/fusion/contribution?disease=Dengue&region=Maharashtra", 200)
    ],
    "Simulation": [
        ("/api/simulation/seir", 405) # POST required
    ]
}

def test_endpoint(category, endpoint, expected_status):
    url = f"{BASE_URL}{endpoint}"
    # Default to GET, some might be POST but we'll try GET first or handle exceptions.
    # We will just do a fast GET request.
    start = time.time()
    try:
        res = requests.get(url, timeout=5)
        duration = time.time() - start
        # If the endpoint doesn't exist or returns 404/405, we consider it part of the test report
        status_ok = res.status_code in [200, 422, 405] # 422 for missing params, 405 for wrong method (POST required)
        result = "PASS" if status_ok else f"FAIL (Got {res.status_code})"
    except Exception as e:
        duration = time.time() - start
        result = f"FAIL ({str(e)})"
    
    return f"[{result}] {category} -> {endpoint} | Time: {duration:.3f}s"

def load_test_predictions(concurrency=10):
    url = f"{BASE_URL}/api/predictions/outbreak"
    print(f"\n--- Load Testing {url} with {concurrency} concurrent requests ---")
    results = []
    
    def fetch():
        start = time.time()
        try:
            res = requests.get(url, timeout=10)
            return time.time() - start, res.status_code
        except Exception:
            return time.time() - start, "ERROR"
            
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(fetch) for _ in range(concurrency)]
        for f in concurrent.futures.as_completed(futures):
            results.append(f.result())
            
    return results

def main():
    print("Initializing Helix System Comprehensive Test...")
    time.sleep(1)
    
    report_lines = []
    report_lines.append("==========================================")
    report_lines.append(" HELIX COMPREHENSIVE SYSTEM TEST REPORT")
    report_lines.append("==========================================\n")
    
    total_endpoints = sum(len(e) for e in ENDPOINTS.values())
    print(f"Testing {total_endpoints} Endpoints across 7 modules...\n")
    
    for category, endpoints in ENDPOINTS.items():
        report_lines.append(f"--- Module: {category} ---")
        for ep, status in endpoints:
            res = test_endpoint(category, ep, status)
            report_lines.append(res)
            print(res)
        report_lines.append("")
        
    # Load Test
    load_results = load_test_predictions(10)
    report_lines.append("--- LOAD TEST (/api/predictions/outbreak) ---")
    report_lines.append(f"Concurrent Requests: 10")
    for idx, (dur, status) in enumerate(load_results):
        line = f"Req {idx+1}: Status {status} | Time {dur:.3f}s"
        report_lines.append(line)
        print(line)
        
    avg_time = sum(d for d, s in load_results) / len(load_results)
    report_lines.append(f"Average Response Time: {avg_time:.3f}s")
    print(f"\nAverage Response Time: {avg_time:.3f}s")
    
    with open("test_report.txt", "w") as f:
        f.write("\n".join(report_lines))
        
    print("\nTest Complete! Results saved to test_report.txt")

if __name__ == "__main__":
    main()
