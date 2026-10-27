"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.NIA_PORT || 3000);
const BASE = `http://127.0.0.1:${PORT}`;
const LOG_DIR = path.join(ROOT, "runtime/revenue-ops");
const LOG_FILE = path.join(LOG_DIR, "health.jsonl");

const ROUTES = [
  { path: "/api/capital/health", expected: [200], label: "Nia health" },
  { path: "/api/revenue/dashboard", expected: [401], label: "Revenue dashboard auth" },
  { path: "/api/revenue/pipeline", expected: [401], label: "Revenue pipeline auth" },
  { path: "/api/acquisition/top", expected: [401], label: "Acquisition auth" },
  { path: "/api/capital/summary", expected: [401], label: "Capital summary auth" }
];

function readJson(relativePath) {
  const file = path.join(ROOT, relativePath);
  try {
    return { exists: true, data: JSON.parse(fs.readFileSync(file, "utf8")) };
  } catch (error) {
    return {
      exists: fs.existsSync(file),
      error: error.message,
      data: null
    };
  }
}

function arrayAt(data, keys) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
}

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "$0.00";
}

async function requestStatus(route) {
  try {
    const response = await fetch(`${BASE}${route.path}`, {
      signal: AbortSignal.timeout(4000)
    });
    return {
      ...route,
      status: response.status,
      ok: route.expected.includes(response.status)
    };
  } catch (error) {
    return {
      ...route,
      status: 0,
      ok: false,
      error: error.name === "TimeoutError" ? "TIMEOUT" : "UNREACHABLE"
    };
  }
}

async function inspect() {
  const checks = await Promise.all(ROUTES.map(requestStatus));
  const pipelineFile = readJson("runtime/revenue-pipeline.json");
  const liveFile = readJson("data/revenue/live-deals.json");
  const dealsFile = readJson("data/revenue/deals.json");

  const pipelineData = pipelineFile.data;
  const prospects = arrayAt(pipelineData, ["prospects", "leads", "opportunities"]);
  const payments = arrayAt(pipelineData, [
    "payment_records", "payments", "owner_confirmed_payments"
  ]);
  const liveDeals = arrayAt(liveFile.data, ["deals", "items"]);
  const deals = arrayAt(dealsFile.data, ["deals", "items"]);

  const awaiting = liveDeals.filter(x =>
    String(x?.status || "").toLowerCase() === "awaiting"
  ).length;

  const authFailures = checks.filter(x =>
    x.label !== "Nia health" && !x.ok
  );
  const health = checks.find(x => x.label === "Nia health");
  const online = Boolean(health?.ok);
  const securityOk = authFailures.length === 0;

  const result = {
    timestamp: new Date().toISOString(),
    online,
    securityOk,
    checks,
    counts: {
      pipelineProspects: prospects.length,
      legacyLiveDeals: liveDeals.length,
      awaitingLegacyDeals: awaiting,
      revenueDeals: deals.length,
      paymentRecords: payments.length
    },
    notes: [
      "Pipeline entries are not proof of revenue.",
      "Awaiting outreach records are not confirmed sales.",
      "Only verified, owner-confirmed receipts count as collected revenue."
    ]
  };

  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(LOG_FILE, JSON.stringify(result) + "\n");
  return result;
}

function printReport(r) {
  console.log("\n========== NIA REVENUE OPERATIONS ==========");
  console.log(`Time:             ${r.timestamp}`);
  console.log(`API online:       ${r.online ? "YES" : "NO"}`);
  console.log(`Route security:   ${r.securityOk ? "PASS" : "CHECK REQUIRED"}`);
  console.log("\n--- SERVICE CHECKS ---");

  for (const c of r.checks) {
    const status = c.status === 0 ? (c.error || "NO RESPONSE") : `HTTP ${c.status}`;
    console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.label}: ${status}`);
  }

  console.log("\n--- REVENUE ACTIVITY ---");
  console.log(`Tracked prospects:        ${r.counts.pipelineProspects}`);
  console.log(`Legacy outreach records:  ${r.counts.legacyLiveDeals}`);
  console.log(`Awaiting responses:       ${r.counts.awaitingLegacyDeals}`);
  console.log(`Revenue deal records:     ${r.counts.revenueDeals}`);
  console.log(`Payment records:          ${r.counts.paymentRecords}`);

  console.log("\n--- NEXT ACTIONS ---");
  if (!r.online) console.log("1. Restore Nia API availability; inspect startup logs.");
  if (!r.securityOk) console.log("2. Investigate failed route-auth checks before revenue operations.");
  if (r.counts.awaitingLegacyDeals > 0) {
    console.log(`Review ${r.counts.awaitingLegacyDeals} awaiting outreach records and their follow-up dates.`);
  }
  if (r.counts.pipelineProspects === 0) {
    console.log("Build a verified, relevant prospect list; do not invent leads.");
  }
  if (r.online && r.securityOk && r.counts.pipelineProspects > 0) {
    console.log("Review qualified prospects, prepare offers, and approve next actions.");
  }
  console.log("\nLog file: runtime/revenue-ops/health.jsonl");
  console.log("============================================\n");
}

async function runOnce() {
  const report = await inspect();
  printReport(report);
  return report;
}

async function main() {
  const command = process.argv[2] || "report";

  if (command === "report" || command === "check") {
    const r = await runOnce();
    if (!r.online || !r.securityOk) process.exitCode = 1;
    return;
  }

  if (command === "watch") {
    const intervalMs = Math.max(30, Number(process.env.NIA_CHECK_SECONDS || 60)) * 1000;
    console.log(`Nia Revenue Ops watch enabled. Checking every ${intervalMs / 1000}s.`);
    console.log("This monitors and logs; it does not restart services or send messages.");
    const cycle = async () => {
      try {
        const r = await runOnce();
        if (!r.online || !r.securityOk) {
          console.error("ALERT: health or security check failed.");
        }
      } catch (error) {
        console.error("Monitor error:", error.message);
      }
    };
    await cycle();
    setInterval(cycle, intervalMs);
    return;
  }

  console.log("Usage: node tools/nia-revenue-ops.js [report|check|watch]");
  process.exitCode = 2;
}

main().catch(error => {
  console.error("Revenue Ops failed:", error.message);
  process.exitCode = 1;
});
