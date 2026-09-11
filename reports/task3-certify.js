#!/usr/bin/env node
// Task 3 — End-to-end certification test
// SCAN → REPAIR → TEST → OPERATIONS, with evidence-gate enforcement

const BASE = "http://127.0.0.1:3000";
const fs = require("fs");
const path = require("path");

const results = [];
let exitCode = 0;

function record(stage, name, pass, detail) {
  results.push({ stage, name, pass, detail });
  const icon = pass ? "✅" : "❌";
  console.log(`${icon} [${stage}] ${name}${detail ? " — " + detail : ""}`);
  if (!pass) exitCode = 1;
}

const AUTH_TOKEN = process.env.NIA_OWNER_AUTH_TOKEN || "";
async function getJSON(p, opts = {}) {
  const r = await fetch(BASE + p, { ...opts, headers: { "Authorization": "Bearer " + AUTH_TOKEN, ...(opts.headers || {}) } });
  const text = await r.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  return { status: r.status, body };
}

async function postJSON(p, payload, opts = {}) {
  const r = await fetch(BASE + p, {
    method: "POST",
    headers: { "content-type": "application/json", "Authorization": "Bearer " + AUTH_TOKEN, ...(opts.headers || {}) },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  return { status: r.status, body };
}

(async () => {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  TASK 3 — END-TO-END CERTIFICATION");
  console.log("  Synthetic flow: SCAN → REPAIR → TEST → OPERATIONS");
  console.log("═══════════════════════════════════════════════════════\n");

  // ─────────── SCAN ───────────
  console.log("─── PHASE 1: SCAN (ingestion) ───");
  const hunt = await getJSON("/api/capital/hunt");
  record("SCAN", "/api/capital/hunt reachable", hunt.status === 200, `HTTP ${hunt.status}`);
  record("SCAN", "Engine returns opportunities array", Array.isArray(hunt.body.opportunities),
         `${hunt.body.opportunities?.length || 0} opportunities`);
  record("SCAN", "Summary populated", !!hunt.body.summary?.total_opportunities,
         `total=${hunt.body.summary?.total_opportunities}`);
  record("SCAN", "Lanes enumerated", Array.isArray(hunt.body.lanes),
         `${hunt.body.lanes?.length || 0} lanes`);

  const health = await getJSON("/api/capital/health");
  record("SCAN", "Engine identity confirmed",
         health.body.engine === "NIA_PARALLEL_CAPITAL_ENGINE",
         health.body.engine);

  // ─────────── REPAIR ───────────
  console.log("\n─── PHASE 2: REPAIR (classification) ───");
  const opps = hunt.body.opportunities || [];
  const classified = opps.filter(o => o.lane && o.amount != null && o.probability != null);
  record("REPAIR", "Opportunities have lane classified",
         opps.length > 0 && classified.length === opps.length,
         `${classified.length}/${opps.length} classified`);
  const byLane = hunt.body.summary?.by_lane || {};
  record("REPAIR", "Lane breakdown present",
         Object.keys(byLane).length > 0,
         JSON.stringify(byLane));

  // ─────────── TEST (evidence gate) ───────────
  console.log("\n─── PHASE 3: TEST (evidence gate enforcement) ───");
  const drafts = await getJSON("/api/owner/grant-drafts");
  record("TEST", "Owner queue reachable", drafts.status === 200, `HTTP ${drafts.status}`);
  record("TEST", "Owner queue has drafts", Array.isArray(drafts.body.drafts) && drafts.body.drafts.length > 0,
         `${drafts.body.drafts?.length || 0} drafts`);

  const lock = drafts.body;
  const lockChecks = [
    ["submissionAllowed", false],
    ["signingAllowed", false],
    ["financialExecutionAllowed", false],
    ["moneyMovementAllowed", false],
    ["automaticApprovalAllowed", false],
    ["ownerApprovalRequired", true],
    ["ownerSignatureRequired", true],
  ];
  for (const [key, expected] of lockChecks) {
    record("TEST", `Lock ${key}=${expected}`, lock[key] === expected, String(lock[key]));
  }

  // Simulate execution attempt — should be blocked
  const execAttempt = await postJSON("/api/owner/grant-drafts/submit", { draftId: "SYNTHETIC-TASK3" });
  const blocked = execAttempt.status >= 400 || execAttempt.body?.submissionAllowed === false;
  record("TEST", "Unauthorized submission blocked",
         blocked, `HTTP ${execAttempt.status}`);

  // ─────────── OPERATIONS ───────────
  console.log("\n─── PHASE 4: OPERATIONS (financial write kill switch) ───");
  const finAttempt = await postJSON("/api/finance/write", {
    type: "revenue",
    amount: 1,
    description: "TASK3-CERTIFICATION-SYNTHETIC",
  });
  const finBlocked = finAttempt.status >= 400 || finAttempt.body?.modified === false;
  record("OPERATIONS", "Financial write blocked",
         finBlocked, `HTTP ${finAttempt.status} modified=${finAttempt.body?.modified}`);
  record("OPERATIONS", "databaseModified is false",
         finAttempt.body?.modified === false || finAttempt.status === 404,
         String(finAttempt.body?.modified));

  // ─────────── SUMMARY ───────────
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const total = results.length;

  const report = {
    task: "Task 3 — End-to-end certification",
    timestamp: new Date().toISOString(),
    summary: { total, passed, failed, exitCode },
    results,
  };
  const outFile = path.join("reports", `task3-certification-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`  RESULT: ${passed}/${total} passed, ${failed} failed`);
  console.log(`  Report: ${outFile}`);
  console.log(`  STATUS: ${exitCode === 0 ? "✅ PASS" : "❌ FAIL"}`);
  console.log("═══════════════════════════════════════════════════════\n");

  process.exit(exitCode);
})().catch(e => { console.error("❌ Fatal:", e.message); process.exit(1); });
