import requests
from urllib.parse import urljoin

def scan_xss(url):
    vulns = []
    # Basic payloads for simple reflection check
    payloads = [
        '<script>alert("xss")</script>',
        '"><img src=x onerror=prompt()>'
    ]
    
    # Ideally, we would parse forms and inputs with BeautifulSoup here,
    # but for a simple scanner, we'll try appending to URL parameters if any exist,
    # or just fetching the base URL to see if it's already reflecting anything (unlikely).
    
    # Simulating a basic check
    try:
        if "?" in url:
            base, qs = url.split("?", 1)
            params = qs.split("&")
            for i in range(len(params)):
                original = params[i]
                for payload in payloads:
                    test_params = params.copy()
                    key = test_params[i].split("=")[0]
                    test_params[i] = f"{key}={payload}"
                    test_url = f"{base}?{'&'.join(test_params)}"
                    
                    response = requests.get(test_url, timeout=10)
                    if payload in response.text:
                        vulns.append({
                            "suggestion": "Sanitize and encode all user input before reflecting it in the response (e.g., HTML entity encoding).",
                            "evidence": f"Payload '{payload}' was reflected in the response without sanitization.",
                            "severity": "High",
                            "description": "Reflected Cross-Site Scripting (XSS) vulnerability detected.",
                            "type": "Reflected XSS",
                            "url": test_url
                        })
                        break # Skip other payloads if we found one for this param
                        
    except Exception as e:
        print(f"Error during XSS scan: {e}")
        
    return vulns
