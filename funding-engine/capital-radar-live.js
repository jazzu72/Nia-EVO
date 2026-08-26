const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(process.cwd(), "data", "capital-radar");
const FILE = path.join(ROOT, "opportunities.json");
const LIVE = path.join(ROOT, "live-sources.json");

fs.mkdirSync(ROOT, { recursive: true });

const sources = [
  {
    name: "Hello Alice Funding",
    url: "https://www.helloalice.com/small-business-grants-and-funding",
    tags: ["grant","small-business","startup","minority","technology"]
  },
  {
    name: "Verizon Small Business",
    url: "https://www.verizon.com/business/solutions/small-business/",
    tags: ["grant","technology","small-business"]
  },
  {
    name: "Main Street Rising",
    url: "https://mainstreet.helloalice.com/",
    tags: ["AI","pitch","small-business","cash-prize"]
  },
  {
    name: "Black Ambition",
    url: "https://blackambitionprize.com/apply-now/",
    tags: ["Black-founder","startup","technology","prize"]
  },
  {
    name: "NAACP Powershift",
    url: "https://naacp.org/find-resources/grants/powershift-entrepreneur-grant",
    tags: ["Black-founder","grant","small-business"]
  }
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Nia-Capital-Radar/1.0"
      }
    }, res => {
      let body = "";

      res.on("data", chunk => {
        body += chunk.toString();
        if (body.length > 500000) res.destroy();
      });

      res.on("end", () => {
        resolve({
          status: res.statusCode,
          finalUrl: res.headers.location || url,
          body
        });
      });
    });

    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error("TIMEOUT"));
    });
  });
}

function detectStatus(body, status) {
  if (status >= 400) return "SOURCE_ERROR";

  const text = body.toLowerCase();

  if (
    text.includes("application closed") ||
    text.includes("applications are closed") ||
    text.includes("not currently open") ||
    text.includes("closed for applications")
  ) {
    return "CLOSED";
  }

  if (
    text.includes("apply now") ||
    text.includes("applications open") ||
    text.includes("open now") ||
    text.includes("apply today")
  ) {
    return "POSSIBLY_OPEN";
  }

  return "VERIFY";
}

async function main() {
  console.log("========================================");
  console.log("🛰️ NIA CAPITAL RADAR — LIVE VERIFICATION");
  console.log("========================================");

  const results = [];

  for (const source of sources) {
    process.stdout.write(`Checking ${source.name} ... `);

    try {
      const r = await fetchPage(source.url);
      const status = detectStatus(r.body, r.status);

      const result = {
        ...source,
        httpStatus: r.status,
        checkedAt: new Date().toISOString(),
        detectedStatus: status,
        verified: status === "POSSIBLY_OPEN",
        humanApprovalRequired: true
      };

      results.push(result);
      console.log(`${status} (${r.status})`);
    } catch (error) {
      results.push({
        ...source,
        checkedAt: new Date().toISOString(),
        detectedStatus: "SOURCE_ERROR",
        verified: false,
        error: error.message,
        humanApprovalRequired: true
      });

      console.log(`SOURCE_ERROR (${error.message})`);
    }
  }

  fs.writeFileSync(LIVE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    sourceCount: results.length,
    results
  }, null, 2));

  const existing = fs.existsSync(FILE)
    ? JSON.parse(fs.readFileSync(FILE, "utf8"))
    : { opportunities: [] };

  const verified = results.filter(x => x.verified);

  for (const item of existing.opportunities || []) {
    const match = results.find(x => x.name === item.name);

    if (match) {
      item.lastLiveCheck = match.checkedAt;
      item.liveStatus = match.detectedStatus;
      item.sourceHttpStatus = match.httpStatus;

      if (match.detectedStatus === "CLOSED") {
        item.status = "WATCH";
        item.eligibility = "CLOSED";
      }

      if (match.detectedStatus === "POSSIBLY_OPEN") {
        item.status = "RESEARCH";
        item.eligibility = "NEEDS_HUMAN_VERIFICATION";
      }
    }
  }

  existing.lastLiveVerification = new Date().toISOString();
  existing.liveVerifiedCount = verified.length;

  fs.writeFileSync(FILE, JSON.stringify(existing, null, 2));

  console.log("");
  console.log("LIVE SOURCES:", results.length);
  console.log("POSSIBLY OPEN:", verified.length);
  console.log("CLOSED:", results.filter(x => x.detectedStatus === "CLOSED").length);
  console.log("VERIFY:", results.filter(x => x.detectedStatus === "VERIFY").length);
  console.log("SOURCE ERRORS:", results.filter(x => x.detectedStatus === "SOURCE_ERROR").length);
  console.log("");
  console.log("LIVE DATA:", LIVE);
  console.log("RADAR DATA:", FILE);
  console.log("========================================");
  console.log("✅ LIVE VERIFICATION COMPLETE");
}

main().catch(err => {
  console.error("❌ RADAR FAILURE:", err.message);
  process.exit(1);
});
