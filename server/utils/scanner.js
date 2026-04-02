async function scanHeaders(targetUrl) {
    const vulns = [];
    try {
        const response = await fetch(targetUrl, { signal: AbortSignal.timeout(10000) });
        const headers = response.headers;
        
        const securityHeaders = [
            'strict-transport-security',
            'content-security-policy',
            'x-content-type-options',
            'x-frame-options'
        ];
        
        for (const header of securityHeaders) {
            if (!headers.has(header)) {
                vulns.push({
                    suggestion: "Configure the server to include this header in responses.",
                    evidence: `Missing ${header}`,
                    severity: "Low",
                    description: `The '${header}' header is missing from the HTTP response, which may leave the application vulnerable to certain client-side attacks.`,
                    type: "Missing Security Header",
                    url: targetUrl
                });
            }
        }
    } catch (e) {
        let msg = e.message;
        if (e.name === 'TimeoutError') msg = 'Request timed out after 10s';
        vulns.push({
            suggestion: "Ensure the target URL is reachable and responding correctly.",
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
        '"><img src=x onerror=prompt()>'
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
                        const response = await fetch(testUrl, { signal: AbortSignal.timeout(10000) });
                        const text = await response.text();
                        if (text.includes(payload)) {
                            vulns.push({
                                suggestion: "Sanitize and encode all user input before reflecting it in the response (e.g., HTML entity encoding).",
                                evidence: `Payload '${payload}' was reflected in the response without sanitization.`,
                                severity: "High",
                                description: "Reflected Cross-Site Scripting (XSS) vulnerability detected.",
                                type: "Reflected XSS",
                                url: testUrl
                            });
                            break; // Skip other payloads if we found one for this param
                        }
                    } catch (e) {
                        console.error(`Error during XSS test for payload on ${testUrl}: ${e.message}`);
                    }
                }
            }
        }
    } catch (e) {
        console.error(`Error during XSS scan: ${e.message}`);
    }
    return vulns;
}

async function runScan(targetUrl) {
    let url = targetUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    try {
        const headerVulns = await scanHeaders(url);
        const xssVulns = await scanXSS(url);
        
        return {
            target: url,
            vulnerabilities: [...headerVulns, ...xssVulns]
        };
    } catch (err) {
        console.error("Scan engine error:", err);
        throw new Error(err.message);
    }
}

module.exports = { runScan };
