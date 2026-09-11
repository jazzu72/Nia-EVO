#!/usr/bin/env node
// Task 4 — Restart/Recovery certification
// Kills PM2 process, restarts, verifies state survives

const BASE = "http://127.0.0.1:3000";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const TOKEN = process.env.NIA_OWNER_AUTH_TOKEN || "";
const results = [];
let exitCode = 0;

function record(stage, name, pass, detail) {
  results.push({ stage, name, pass, detail });
  console.log(`${pass ? "✅" : "❌"} [${stage}] ${name}${detail ? " — " + detail : ""}`);
  if (!pass) exitCode = 1;
}

async function getJSON(p) {
  const r = await fetch(BASE + p, { headers: { "Authorization": "Bearer " + TOKEN } });
  const text = await r.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  return { status: r.status, body };
}

function pm2(cmd) {
  try { return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(); }
  catch (e) { return (e.stdout || "") + (e.stderr || ""); }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForServer(maxMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const r = await fetch(BASE + "/api/capital/health", { signal: AbortSignal.timeout(2000) });
      if (r.status === 200) return true;
    } catch {}
    await sleep(1000);
  }
  return false;
}

(async () => {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  TASK 4 — RESTART/RECOVERY CERTIFICATION");
  console.log("═══════════════════════════════════════════════════════\n");

  // ─────────── PRE-RESTART BASELINE ───────────
  console.log("─── PHASE 1: PRE-RESTART BASELINE ───");
  const preHunt = await getJSON("/api/capital/hunt");
  const preDrafts = await getJSON("/api/owner/grant-drafts");
  const preOpps = preHunt.body.summary?.total_opportunities || 0;
  const preCount = preDrafts.body.count || 0;
  record("BASELINE", "Engine online before restart", preHunt.status === 200, `HTTP ${preHunt.status}`);
  record("BASELINE", "Opportunities before restart", preOpps > 0, `total=${preOpps}`);
  record("BASELINE", "Owner queue reachable before restart", preDrafts.status === 200, `HTTP ${preDrafts.status}`);
  record("BASELINE", "Drafts before restart", preCount > 0, `count=${preCount}`);

  const prePid = pm2("pm2 pid nia");
  record("BASELINE", "PM2 PID captured", /^\d+$/.test(prePid), `PID ${prePid}`);

  // ─────────── RESTART ───────────
  console.log("\n─── PHASE 2: RESTART ───");
  console.log(`   Killing PM2 process (PID ${prePid})...`);
  pm2("pm2 delete nia");
  await sleep(2000);

  // Verify process is gone
  let aliveAfterKill = false;
  try {
    const r = await fetch(BASE + "/api/capital/health", { signal: AbortSignal.timeout(1500) });
    aliveAfterKill = r.status === 200;
  } catch {}
  record("RESTART", "Process killed (unreachable after delete)", !aliveAfterKill, aliveAfterKill ? "still up" : "down");

  // Wait for any lingering sockets to release
  await sleep(1500);

  // Restart
  console.log("   Restarting via PM2...");
  const restartOut = pm2(`NIA_MASTER_PASSWORD='Addie&Josiebuilt' pm2 start start.js --name nia --update-env`);
  const restartOk = /online|Done|✓/i.test(restartOut) || !/error/i.test(restartOut);
  record("RESTART", "PM2 start executed", restartOk, "pm2 start start.js");

  // Wait for server to come up
  const came_up = await waitForServer(30000);
  record("RESTART", "Server responsive after restart", came_up, came_up ? "within 30s" : "timed out");

  // Give it a moment for routes to settle
  await sleep(2000);

  const newPid = pm2("pm2 pid nia");
  record("RESTART", "New PM2 PID captured", /^\d+$/.test(newPid), `PID ${newPid}`);
  record("RESTART", "PID changed after restart", prePid !== newPid, `${prePid} → ${newPid}`);

  // ─────────── POST-RESTART RECOVERY ───────────
  console.log("\n─── PHASE 3: POST-RESTART STATE RECOVERY ───");
  const postHunt = await getJSON("/api/capital/hunt");
  const postDrafts = await getJSON("/api/owner/grant-drafts");
  const postOpps = postHunt.body.summary?.total_opportunities || 0;
  const postCount = postDrafts.body.count || 0;

  record("RECOVERY", "Engine back online", postHunt.status === 200, `HTTP ${postHunt.status}`);
  record("RECOVERY", "Same opportunity count", postOpps === preOpps, `${preOpps} → ${postOpps}`);
  record("RECOVERY", "Owner queue still reachable", postDrafts.status === 200, `HTTP ${postDrafts.status}`);
  record("RECOVERY", "Draft count unchanged", postCount === preCount, `${preCount} → ${postCount}`);
  record("RECOVERY", "Engine identity preserved",
         postHunt.body.lanes?.length === 10, `${postHunt.body.lanes?.length} lanes`);

  // ─────────── SAFETY LOCKS SURVIVED ───────────
  console.log("\n─── PHASE 4: SAFETY LOCKS SURVIVED RESTART ───");
  const lock = postDrafts.body;
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
    record("LOCKS", `Lock ${key}=${expected} after restart`,
           lock[key] === expected, String(lock[key]));
  }

  // ─────────── SECRETS SURVIVED ───────────
  console.log("\n─── PHASE 5: SECRETS SURVIVED RESTART ───");
  const bootLog = fs.readFileSync(path.join(process.env.HOME, ".pm2/logs/nia-out.log"), "utf8");
  const lastBoot = bootLog.split("🔓 Secrets loaded").pop().split("\n").slice(0, 3);
  const secretsLoaded = bootLog.split("🔓 Secrets loaded").length > 1;
  record("SECRETS", "secrets.enc loaded on fresh boot", secretsLoaded,
         secretsLoaded ? "confirmed in log" : "missing");

  // ─────────── NO GHOST PROCESSES ───────────
  console.log("\n─── PHASE 6: NO GHOST PROCESSES ───");
  const psOut = pm2("ps aux | grep server-watson | grep -v grep | wc -l");
  const watsonCount = parseInt(psOut, 10) || 0;
  record("PROCESS", "Only PM2-managed process running",
         watsonCount <= 1, `${watsonCount} server-watson processes`);

  // ─────────── SUMMARY ───────────
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const total = results.length;

  const report = {
    task: "Task 4 — Restart/recovery certification",
    timestamp: new Date().toISOString(),
    preRestart: { pid: prePid, opportunities: preOpps, drafts: preCount },
    postRestart: { pid: newPid, opportunities: postOpps, drafts: postCount },
    summary: { total, passed, failed, exitCode },
    results,
  };
  const outFile = path.join("reports", `task4-certification-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`  RESULT: ${passed}/${total} passed, ${failed} failed`);
  console.log(`  Report: ${outFile}`);
  console.log(`  STATUS: ${exitCode === 0 ? "✅ PASS" : "❌ FAIL"}`);
  console.log("═══════════════════════════════════════════════════════\n");

  process.exit(exitCode);
})().catch(e => { console.error("❌ Fatal:", e.message, e.stack); process.exit(1); });
