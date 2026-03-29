import os
import sys
import json
from urllib.parse import urlparse

# Ensure the scanner directory is in sys.path so modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from modules.headers_scan import scan_headers
from modules.xss_scan import scan_xss

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing JSON input argument"}))
        sys.exit(1)
        
    try:
        args = json.loads(sys.argv[1])
        target_url = args.get("target")
        
        if not target_url:
            raise ValueError("Target URL not provided")
            
        # Parse URL to ensure format is valid
        parsed = urlparse(target_url)
        if not parsed.scheme:
            target_url = "http://" + target_url
            
        vulnerabilities = []
        
        # 1. Check Security Headers
        header_vulns = scan_headers(target_url)
        vulnerabilities.extend(header_vulns)
        
        # 2. Basic XSS Check
        xss_vulns = scan_xss(target_url)
        vulnerabilities.extend(xss_vulns)
        
        # Additional checks can be added here
        
        results = {
            "target": target_url,
            "vulnerabilities": vulnerabilities
        }
        
        # Print actual results as JSON for Node.js to read
        print(json.dumps(results))
        
    except Exception as e:
        print(json.dumps({"error": str(e), "vulnerabilities": []}))
        sys.exit(1)

if __name__ == "__main__":
    main()
