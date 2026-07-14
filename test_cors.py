import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    "https://stadiaflow-ai.onrender.com/api/health",
    headers={"Origin": "https://stadia-flow-ai.vercel.app"}
)

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        print("Status Code:", response.status)
        print("Headers:")
        for key, val in response.headers.items():
            print(f"  {key}: {val}")
except Exception as e:
    print("Error:", e)
