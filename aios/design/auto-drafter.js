/*
  NIA AUTO-DRAFTER — autonomous proposal generation inside T2.5 envelopes
  Watches opportunities, drafts within signed authority, queues for owner review.
  Every action logged. No submission. No sending. Owner reviews all.
*/

const fs = require("fs");
const path = require("path");
const llm = require("../../tools/llm");
const envelopes = require("./t2-envelopes");
const gate = require("../../tools/autonomy-gate");

const QUEUE_DIR = "runtime/auto-drafts";
const QUEUE_FILE = path.join(QUEUE_DIR, "queue.json");
const LOG_FILE = path.join(QUEUE_DIR, "activity.log");

function ensure() {
  if (!fs.existsSync(QUEUE_DIR)) fs.mkdirSync(QUEUE_DIR, { recursive: true });
}

function loadQueue() {
  ensure();
  try {
    if (!fs.existsSync(QUEUE_FILE)) return { drafts: [], updated_at: null };
    return JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
  } catch (e) { return { drafts: [], updated_at: null }; }
}

function saveQueue(q) {
  ensure();
  q.updated_at = new Date().toISOString();
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(q, null, 2));
}

function log(entry) {
  ensure();
  fs.appendFileSync(LOG_FILE, JSON.stringify(Object.assign({ ts: new Date().toISOString() }, entry)) + "\n");
}

async function draftOpportunity(opp, envelope) {
  const prompt = [
    "Draft a concise, evidence-only grant/application executive summary.",
    "Use ONLY the fields provided. Mark unknowns as [TO BE CONFIRMED].",
    "Max 250 words. Plain text. No markdown headers.",
    "",
    "Opportunity: " + (opp.organization || opp.title || "Untitled"),
    "Lane: " + (opp.lane || "unknown"),
    "Source: " + (opp.source || "NIA"),
    "Amount: $" + (opp.amount || 0).toLocaleString(),
    "Confidence: " + Math.round((opp.probability || 0) * 100) + "%",
    "",
    "Structure: (1) what this is, (2) why House of Jazzu fits, (3) what evidence we still need.",
  ].join("\n");

  const result = await llm.generate(prompt, function () {
    return "Executive Summary\n\n" + (opp.organization || opp.title) + " — a " +
      (opp.lane || "capital") + " opportunity valued at $" + (opp.amount || 0).toLocaleString() +
      " (" + Math.round((opp.probability || 0) * 100) + "% confidence).\n\n" +
      "Why House of Jazzu: NIA Capital Observatory identifies and prepares this submission with owner review required before any action.\n\n" +
      "Evidence required: [TO BE CONFIRMED] eligibility, [TO BE CONFIRMED] deadline, [TO BE CONFIRMED] required documents.";
  });

  return {
    draft_id: "AUTO-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    opportunity_id: opp.id,
    opportunity_name: opp.organization || opp.title || "Untitled",
    lane: opp.lane,
    amount: opp.amount || 0,
    confidence: Math.round((opp.probability || 0) * 100),
    generator: result.generator,
    envelope_id: envelope.envelope_id,
    content: result.text,
    created_at: new Date().toISOString(),
    status: "PENDING_OWNER_REVIEW",
    requires: ["owner_review", "owner_signature_before_submission"],
  };
}

async function runAutoDraft(options) {
  options = options || {};
  const dailyCap = options.daily_cap || 5;
  const minConfidence = options.min_confidence || 0.6;
  const lanes = options.lanes || ["grants", "customer_revenue", "enterprise_sales"];

  const engine = require(path.join(__dirname, "..", "capital", "parallel-capital-engine"));

  let opportunities = [];
  try {
    const sources = await engine.getLiveCapitalSources();
    const result = await engine.discover(sources);
    opportunities = result.opportunities || [];
  } catch (e) {
    log({ event: "scan_failed", error: e.message });
    return { ok: false, error: "scan_failed", message: e.message };
  }

  // Filter: high-confidence, in authorized lanes
  const eligible = opportunities.filter(function (o) {
    if (Number(o.probability || 0) < minConfidence) return false;
    if (lanes.length && lanes.indexOf(o.lane) === -1) return false;
    return true;
  }).sort(function (a, b) {
    return (b.amount || 0) * (b.probability || 0) - (a.amount || 0) * (a.probability || 0);
  });

  // Check envelope allows auto-drafting
  const decision = envelopes.checkEnvelope("draft_proposal", 0, {});
  if (!decision.allowed) {
    log({ event: "blocked_no_envelope", reason: decision.reason });
    return { ok: false, error: "NO_ENVELOPE", message: "Sign an envelope authorizing draft_proposal before running autonomous drafting." };
  }

  // Daily cap check
  const queue = loadQueue();
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = (queue.drafts || []).filter(function (d) { return d.created_at.slice(0, 10) === today; }).length;
  const remaining = Math.max(0, dailyCap - todayCount);

  if (remaining === 0) {
    log({ event: "daily_cap_reached", today: todayCount, cap: dailyCap });
    return { ok: true, drafted: 0, reason: "daily_cap_reached", today_count: todayCount };
  }

  // Draft up to `remaining` eligible opportunities
  const toDraft = eligible.slice(0, remaining);
  const drafted = [];

  for (const opp of toDraft) {
    try {
      const draft = await draftOpportunity(opp, decision);
      drafted.push(draft);
      queue.drafts.push(draft);
      log({ event: "draft_created", draft_id: draft.draft_id, opp: draft.opportunity_name, generator: draft.generator });
    } catch (e) {
      log({ event: "draft_failed", opp: opp.id, error: e.message });
    }
  }

  saveQueue(queue);

  return {
    ok: true,
    drafted: drafted.length,
    today_count: todayCount + drafted.length,
    daily_cap: dailyCap,
    envelope_id: decision.envelope_id,
    drafts: drafted.map(function (d) {
      return { draft_id: d.draft_id, opportunity: d.opportunity_name, amount: d.amount, confidence: d.confidence, generator: d.generator };
    }),
  };
}

function listDrafts(filter) {
  filter = filter || {};
  const q = loadQueue();
  let drafts = q.drafts || [];
  if (filter.status) drafts = drafts.filter(function (d) { return d.status === filter.status; });
  if (filter.since) {
    const cutoff = new Date(filter.since).getTime();
    drafts = drafts.filter(function (d) { return new Date(d.created_at).getTime() >= cutoff; });
  }
  return drafts.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function markReviewed(draft_id, action) {
  const q = loadQueue();
  const d = q.drafts.find(function (x) { return x.draft_id === draft_id; });
  if (!d) return null;
  d.status = action || "REVIEWED";
  d.reviewed_at = new Date().toISOString();
  saveQueue(q);
  log({ event: "draft_reviewed", draft_id: draft_id, action: d.status });
  return d;
}

module.exports = { runAutoDraft, listDrafts, markReviewed };
