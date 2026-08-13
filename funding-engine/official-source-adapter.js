const https = require("https");
const { URL } = require("url");

const ALLOWED_PROTOCOLS = new Set(["https:"]);

function fetchText(rawUrl, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new URL(rawUrl); }
    catch { return reject(new Error("INVALID_URL")); }

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol))
      return reject(new Error("HTTPS_REQUIRED"));

    const req = https.get(parsed, {
      headers: {
        "User-Agent": "Nia-Capital-OS/1.0 funding-research",
        "Accept": "text/html,application/json"
      }
    }, res => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300)
          return reject(new Error(`HTTP_${res.statusCode}`));

        resolve({
          url: rawUrl,
          statusCode: res.statusCode,
          contentType: res.headers["content-type"] || "",
          body
        });
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("REQUEST_TIMEOUT"));
    });

    req.on("error", reject);
  });
}

function normalizeSource(rawUrl) {
  const parsed = new URL(rawUrl);

  return {
    officialUrl: parsed.toString(),
    hostname: parsed.hostname.toLowerCase(),
    protocol: parsed.protocol
  };
}

function buildSourceRecord(rawUrl) {
  const source = normalizeSource(rawUrl);

  return {
    source: source.hostname,
    officialUrl: source.officialUrl,
    sourceVerified: source.protocol === "https:",
    eligibilityEvidence: "",
    deadlineEvidence: "",
    fundingAmountEvidence: "",
    verificationStatus: "REQUIRES_CONTENT_VERIFICATION",
    ownerReviewOnly: true,
    submissionAllowed: false,
    signingAllowed: false,
    financialExecutionAllowed: false,
    moneyMovementAllowed: false,
    automaticApprovalAllowed: false,
    ownerApprovalRequired: true,
    ownerSignatureRequired: true
  };
}

module.exports = {
  fetchText,
  normalizeSource,
  buildSourceRecord
};
