import requests

def scan_headers(url):
    vulns = []
    try:
        response = requests.get(url, timeout=10)
        headers = response.headers
        
        security_headers = [
            'Strict-Transport-Security',
            'Content-Security-Policy',
            'X-Content-Type-Options',
            'X-Frame-Options'
        ]
        
        for header in security_headers:
            if header not in headers:
                vulns.append({
                    "suggestion": "Configure the server to include this header in responses.",
                    "evidence": f"Missing {header}",
                    "severity": "Low",
                    "description": f"The '{header}' header is missing from the HTTP response, which may leave the application vulnerable to certain client-side attacks.",
                    "type": "Missing Security Header",
                    "url": url
                })
                
    except requests.RequestException as e:
        vulns.append({
            "suggestion": "Ensure the target URL is reachable and responding correctly.",
            "evidence": str(e),
            "severity": "Low",
            "description": "Failed to retrieve HTTP headers from the target URL.",
            "type": "Connection Error",
            "url": url
        })
        
    return vulns
