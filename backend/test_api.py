import urllib.request
import urllib.error

try:
    req = urllib.request.Request("http://127.0.0.1:8080/api/who/live-outbreaks")
    with urllib.request.urlopen(req) as response:
        print("STATUS:", response.status)
        print("BODY:", response.read().decode('utf-8')[:200])
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print("BODY:", e.read().decode('utf-8')[:200])
except Exception as e:
    print("ERROR:", str(e))
