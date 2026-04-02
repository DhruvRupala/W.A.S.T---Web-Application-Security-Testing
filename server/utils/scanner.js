async function scanHeaders(targetUrl) {
    const vulns = [];
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(targetUrl, { 
            signal: controller.signal,
            headers: { 'User-Agent': 'WAST-SecurityScanner/1.0' }
        });
        clearTimeout(timeout);
        
        const headers = response.headers;
        
        const securityHeaders = [
            { name: 'strict-transport-security', desc: 'HTTP Strict Transport Security (HSTS) prevents protocol downgrade attacks and cookie hijacking.' },
            { name: 'content-security-policy', desc: 'Content Security Policy (CSP) helps prevent XSS, clickjacking, and other code injection attacks.' },
            { name: 'x-content-type-options', desc: 'X-Content-Type-Options prevents MIME-type sniffing attacks.' },
            { name: 'x-frame-options', desc: 'X-Frame-Options prevents clickjacking by controlling whether the page can be embedded in iframes.' },
            { name: 'x-xss-protection', desc: 'X-XSS-Protection enables the browser built-in XSS filter.' },
            { name: 'referrer-policy', desc: 'Referrer-Policy controls how much referrer information is sent with requests.' },
            { name: 'permissions-policy', desc: 'Permissions-Policy controls which browser features the page can use (camera, mic, geolocation, etc.).' }
        ];
        
        for (const header of securityHeaders) {
            if (!headers.has(header.name)) {
                vulns.push({
                    suggestion: `Configure the server to include the '${header.name}' header in HTTP responses.`,
                    evidence: `Missing ${header.name}`,
                    severity: header.name === 'content-security-policy' ? 'Medium' : 'Low',
                    description: header.desc,
                    type: "Missing Security Header",
                    url: targetUrl
                });
            }
        }

        // Check for insecure cookies
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            if (!setCookie.toLowerCase().includes('secure')) {
                vulns.push({
                    suggestion: "Add the 'Secure' flag to all cookies to prevent transmission over unencrypted connections.",
                    evidence: `Cookie header found without 'Secure' flag`,
                    severity: "Medium",
                    description: "Cookies are being set without the Secure flag, meaning they could be transmitted over HTTP.",
                    type: "Insecure Cookie",
                    url: targetUrl
                });
            }
            if (!setCookie.toLowerCase().includes('httponly')) {
                vulns.push({
                    suggestion: "Add the 'HttpOnly' flag to cookies to prevent access from JavaScript.",
                    evidence: `Cookie header found without 'HttpOnly' flag`,
                    severity: "Medium",
                    description: "Cookies are being set without the HttpOnly flag, making them accessible to client-side scripts.",
                    type: "Insecure Cookie",
                    url: targetUrl
                });
            }
        }

        // Check for server information disclosure
        const serverHeader = response.headers.get('server');
        const poweredBy = response.headers.get('x-powered-by');
        if (serverHeader) {
            vulns.push({
                suggestion: "Remove or obfuscate the 'Server' header to prevent server technology disclosure.",
                evidence: `Server: ${serverHeader}`,
                severity: "Low",
                description: "The server is disclosing its software version through the 'Server' header.",
                type: "Information Disclosure",
                url: targetUrl
            });
        }
        if (poweredBy) {
            vulns.push({
                suggestion: "Remove the 'X-Powered-By' header to prevent technology disclosure.",
                evidence: `X-Powered-By: ${poweredBy}`,
                severity: "Low",
                description: "The server is disclosing its technology stack through the 'X-Powered-By' header.",
                type: "Information Disclosure",
                url: targetUrl
            });
        }

    } catch (e) {
        let msg = e.message;
        if (e.name === 'AbortError') msg = 'Request timed out after 15s — target may be unreachable from this server';
        if (e.cause?.code === 'ENOTFOUND') msg = `DNS lookup failed — hostname not found: ${targetUrl}`;
        if (e.cause?.code === 'ECONNREFUSED') msg = `Connection refused by target: ${targetUrl}`;
        if (e.cause?.code === 'ECONNRESET') msg = `Connection reset — the target or a firewall dropped the connection`;
        
        vulns.push({
            suggestion: "Ensure the target URL is reachable. If running on a free hosting tier (e.g., Render), outbound requests may be restricted. Try running the scan locally.",
            evidence: msg,
            severity: "Low",
            description: "Failed to retrieve HTTP headers from the target URL.",
            type: "Connection Error",
            url: targetUrl
        });
    }
    return vulns;
}

async function scanXSS(targetUrl) {
    const vulns = [];
    const payloads = [
        '<script>alert("xss")</script>',
        '"><img src=x onerror=prompt()>',
        "'-alert(1)-'",
        '<svg/onload=alert(1)>'
    ];

    try {
        if (targetUrl.includes("?")) {
            const [base, qs] = targetUrl.split("?");
            const params = qs.split("&");

            for (let i = 0; i < params.length; i++) {
                for (const payload of payloads) {
                    const testParams = [...params];
                    const key = testParams[i].split("=")[0];
                    testParams[i] = `${key}=${encodeURIComponent(payload)}`;
                    const testUrl = `${base}?${testParams.join("&")}`;

                    try {
                        const controller = new AbortController();
                        const timeout = setTimeout(() => controller.abort(), 10000);
                        
                        const response = await fetch(testUrl, { 
                            signal: controller.signal,
                            headers: { 'User-Agent': 'WAST-SecurityScanner/1.0' }
                        });
                        clearTimeout(timeout);
                        
                        const text = await response.text();
                        if (text.includes(payload)) {
                            vulns.push({
                                suggestion: "Sanitize and encode all user input before reflecting it in the response (e.g., HTML entity encoding).",
                                evidence: `Payload '${payload}' was reflected in the response without sanitization.`,
                                severity: "High",
                                description: "Reflected Cross-Site Scripting (XSS) vulnerability detected. An attacker can inject malicious scripts via URL parameters.",
                                type: "Reflected XSS",
                                url: testUrl
                            });
                            break;
                        }
                    } catch (e) {
                        // Individual payload test failed — continue with others
                        console.error(`XSS test timeout/error for ${key}: ${e.message}`);
                    }
                }
            }
        }
    } catch (e) {
        console.error(`Error during XSS scan: ${e.message}`);
    }
    return vulns;
}

async function checkReachability(url) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, { 
            method: 'HEAD',
            signal: controller.signal,
            headers: { 'User-Agent': 'WAST-SecurityScanner/1.0' }
        });
        clearTimeout(timeout);
        
        return { reachable: true, status: response.status };
    } catch (e) {
        let reason = e.message;
        if (e.name === 'AbortError') reason = 'Connection timed out (10s) — target unreachable from this server';
        if (e.cause?.code === 'ENOTFOUND') reason = `DNS lookup failed — hostname "${new URL(url).hostname}" does not exist`;
        if (e.cause?.code === 'ECONNREFUSED') reason = `Connection refused — no service is listening at ${url}`;
        if (e.cause?.code === 'ECONNRESET') reason = 'Connection reset by target or blocked by firewall';
        if (e.cause?.code === 'ERR_TLS_CERT_ALTNAME_INVALID') reason = 'SSL certificate error — hostname mismatch';
        
        return { reachable: false, reason };
    }
}

async function runScan(targetUrl) {
    let url = targetUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    // Pre-flight: check if target is reachable
    const reachability = await checkReachability(url);
    if (!reachability.reachable) {
        return {
            target: url,
            vulnerabilities: [],
            error: reachability.reason
        };
    }

    try {
        const [headerVulns, xssVulns] = await Promise.allSettled([
            scanHeaders(url),
            scanXSS(url)
        ]);

        const vulnerabilities = [
            ...(headerVulns.status === 'fulfilled' ? headerVulns.value : []),
            ...(xssVulns.status === 'fulfilled' ? xssVulns.value : [])
        ];

        // Collect any module-level errors
        const errors = [];
        if (headerVulns.status === 'rejected') errors.push(`Header scan: ${headerVulns.reason?.message}`);
        if (xssVulns.status === 'rejected') errors.push(`XSS scan: ${xssVulns.reason?.message}`);

        return {
            target: url,
            vulnerabilities,
            error: errors.length > 0 ? errors.join('; ') : null,
            partialFailure: errors.length > 0
        };
    } catch (err) {
        console.error("Scan engine error:", err);
        return {
            target: url,
            vulnerabilities: [],
            error: `Scan engine error: ${err.message}`
        };
    }
}

module.exports = { runScan };
