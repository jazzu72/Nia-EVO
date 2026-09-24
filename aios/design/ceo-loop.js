/*
  NIA CEO DAILY LOOP — she runs the day
  Every action inside the owner-signed envelope. Every action logged.
  Owner gets: daily summary + approval queue. Nothing else.
*/

const fs = require("fs");
const path = require("path");
const exec = require("./executive-actions");
const envelopes = require("./t2-envelopes");

const STATE_FILE = "runtime/ceo-state.json";

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); }
  catch (e) { return { last_run: {}, history: [] }; }
}

function saveState(s) {
  const d = path.dirname(STATE_FILE);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

function loadJSON(p, def) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch (e) { return def; }
}

// ─── 1. MORNING SCAN (6 AM) ────────────────────────────────
async function morningScan() {
  console.log("[CEO] Morning scan");
  const engine = require("../capital/parallel-capital-engine");
  const sources = await engine.getLiveCapitalSources();
  const result = await engine.discover(sources);
  const opps = result.opportunities || [];
  const qualified = opps.filter(o => (o.probability || 0) >= 0.6);
  console.log("  Found " + opps.length + " opportunities, " + qualified.length + " qualified");
  return { total: opps.length, qualified: qualified.length, summary: result.summary };
}

// ─── 2. OUTREACH BATCH (10 AM) ─────────────────────────────
async function outreachBatch(maxToSend) {
  maxToSend = maxToSend || 5;
  console.log("[CEO] Outreach batch");

  const decision = envelopes.checkEnvelope("send_email", 0, {});
  if (!decision.allowed) {
    console.log("  ⚠️  No active email envelope — skipping");
    return { sent: 0, skipped: true };
  }

  const contacts = loadJSON("data/contacts/contacts.json", { grants: [], businesses: [] });
  const tried = loadJSON("runtime/contacts-tried.json", { emails: [] });
  const triedSet = new Set(tried.emails || []);

  // Priority: grants first, then businesses
  const queue = [].concat(
    (contacts.grants || []).map(c => ({ ...c, kind: "grant" })),
    (contacts.businesses || []).map(c => ({ ...c, kind: "business" }))
  ).filter(c => c.email && !triedSet.has(c.email));

  const batch = queue.slice(0, maxToSend);
  let sent = 0;

  for (const c of batch) {
    const body = c.kind === "grant" ? [
      "Hello " + c.name + ",",
      "",
      "I am Nia, executive AI at House of Jazzu LLC — a Norfolk-based technology company building governed autonomous AI systems.",
      "",
      "We are reaching out regarding funding opportunities at " + c.org + ". House of Jazzu is a Virginia-based, for-profit technology company (EIN 39-3277658) developing AI infrastructure and autonomous business systems.",
      "",
      "Please advise on the current application window and any preliminary materials you would like us to provide.",
      "",
      "Thank you for your time.",
      "",
      "Nia",
      "Executive AI, House of Jazzu LLC",
      "757-339-9245 · lesane1972@gmail.com"
    ].join("\n") : [
      "Hello,",
      "",
      "I am Nia, executive AI at House of Jazzu LLC — a Norfolk-based company that writes grant applications for small businesses.",
      "",
      "We find grants your business qualifies for and write the full application (10 sections, submission-ready). $500 per application — you pay after you receive the draft.",
      "",
      "Free 15-minute call to see what grants fit your business. Reply to this email.",
      "",
      "Nia",
      "Executive AI, House of Jazzu LLC",
      "757-339-9245 · lesane1972@gmail.com"
    ].join("\n");

    const r = await exec.sendViaGmail({
      to: [c.email],
      subject: c.kind === "grant"
        ? "House of Jazzu — Funding Inquiry"
        : "Grant writing for your business — $500 per application",
      body: body,
      reply_to: "lesane1972@gmail.com"
    });
    console.log("  " + (r.ok ? "✅" : "❌") + " " + c.name + " <" + c.email + ">");
    if (r.ok) {
      sent++;
      tried.emails.push(c.email);
    }
    await new Promise(function (rs) { setTimeout(rs, 2500); });
  }

  tried.emails = Array.from(new Set(tried.emails));
  fs.writeFileSync("runtime/contacts-tried.json", JSON.stringify(tried, null, 2));
  return { sent: sent, attempted: batch.length };
}

// ─── 3. GRANT DRAFTING (2 PM) ──────────────────────────────
async function grantDrafting(maxDrafts) {
  maxDrafts = maxDrafts || 3;
  console.log("[CEO] Grant drafting");

  const decision = envelopes.checkEnvelope("draft_proposal", 0, {});
  if (!decision.allowed) {
    console.log("  ⚠️  No active draft envelope — skipping");
    return { drafted: 0, skipped: true };
  }

  const qualifier = require("../grants/qualification-engine");
  const gen = require("./grant-application");

  const result = qualifier.filterQualified();
  const targets = result.qualified.slice(0, maxDrafts);

  let drafted = 0;
  for (const grant of targets) {
    try {
      const app = await gen.generateApplication({
        id: grant.id,
        organization: grant.name,
        title: grant.name,
        lane: grant.lane,
        source: grant.funder,
        amount: parseInt((grant.awardAmount || "0").replace(/[^0-9]/g, "").slice(0, 7)) || 250000,
        probability: 0.7,
        description: (grant.technicalFit || []).join(", ")
      });
      console.log("  ✅ " + grant.name + " → " + app.application_id);
      drafted++;
    } catch (e) {
      console.log("  ❌ " + grant.name + ": " + e.message);
    }
  }
  return { drafted: drafted, attempted: targets.length };
}

// ─── 4. EVENING REPORT (6 PM) ──────────────────────────────
async function eveningReport(dayResult) {
  console.log("[CEO] Evening report");
  const notify = require("./notify");
  const body = [
    "NIA CEO DAILY REPORT — " + new Date().toISOString().slice(0, 10),
    "",
    "MORNING SCAN:",
    "  " + (dayResult.scan.total || 0) + " opportunities found",
    "  " + (dayResult.scan.qualified || 0) + " qualified for outreach",
    "",
    "OUTREACH:",
    "  " + (dayResult.outreach.sent || 0) + " emails sent",
    "",
    "GRANT DRAFTING:",
    "  " + (dayResult.drafting.drafted || 0) + " applications queued",
    "",
    "PIPELINE:",
    "  Check: /api/owner/application/list",
    "  Queue: /api/owner/auto-draft/queue",
    "",
    "REPLIES NEEDING YOU:",
    "  Check your inbox. When a grant officer replies, forward to me and I will draft the response.",
    "",
    "— Nia"
  ].join("\n");

  try {
    const r = await notify.notifyOwner("Daily Report", body);
    console.log("  Report email: " + (r.ok ? "sent" : "failed — " + r.error));
  } catch (e) {
    console.log("  Report failed: " + e.message);
  }
}

// ─── FULL DAY ──────────────────────────────────────────────
async function runFullDay() {
  console.log("");
  console.log("═══════════════════════════════════════════════");
  console.log("  NIA CEO DAILY LOOP — " + new Date().toISOString());
  console.log("═══════════════════════════════════════════════");
  console.log("");

  const state = loadState();
  const dayResult = {};

  try { dayResult.scan = await morningScan(); } catch (e) { dayResult.scan = { total: 0, qualified: 0, error: e.message }; }
  try { dayResult.outreach = await outreachBatch(5); } catch (e) { dayResult.outreach = { sent: 0, error: e.message }; }
  try { dayResult.drafting = await grantDrafting(3); } catch (e) { dayResult.drafting = { drafted: 0, error: e.message }; }
  try { await eveningReport(dayResult); } catch (e) { console.log("Report error: " + e.message); }

  state.history.push({ ts: new Date().toISOString(), result: dayResult });
  state.last_run = dayResult;
  saveState(state);

  console.log("");
  console.log("═══════════════════════════════════════════════");
  console.log("  DAY COMPLETE");
  console.log("═══════════════════════════════════════════════");
  return dayResult;
}

module.exports = { runFullDay, morningScan, outreachBatch, grantDrafting, eveningReport };
