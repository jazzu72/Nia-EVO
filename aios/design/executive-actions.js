/*
  NIA EXECUTIVE ACTIONS — what Nia does as CEO
  Every action gated by a T2.5 signed envelope.
  No envelope = no action. Owner controls everything.
*/

const fs = require("fs");
const path = require("path");
const envelopes = require("./t2-envelopes");

const EXEC_LOG = "runtime/executive-actions.log";
const QUEUE_FILE = "runtime/executive-queue.json";

function ensure() {
  const d = path.dirname(EXEC_LOG);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function log(entry) {
  ensure();
  fs.appendFileSync(EXEC_LOG, JSON.stringify(Object.assign({ ts: new Date().toISOString() }, entry)) + "\n");
}

function loadQueue() {
  ensure();
  try { return JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8")); }
  catch (e) { return { actions: [], updated_at: null }; }
}

function saveQueue(q) {
  ensure();
  q.updated_at = new Date().toISOString();
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(q, null, 2));
}

// ─── SEND EMAIL (via Resend) ────────────────────────────────
async function sendEmail(spec) {
  const decision = envelopes.checkEnvelope("send_email", 0, { to: spec.to });
  if (!decision.allowed) {
    return { ok: false, blocked: true, reason: decision.reason, envelope: decision };
  }

  const key = process.env.RESEND_API_KEY;
  if (!key || key.length < 10 || key.indexOf("XXXXX") !== -1) {
    return { ok: false, blocked: true, reason: "RESEND_API_KEY not configured" };
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "authorization": "Bearer " + key, "content-type": "application/json" },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        from: spec.from || "Nia <nia@houseofjazzu.com>",
        to: spec.to,
        subject: spec.subject,
        text: spec.body,
        reply_to: spec.reply_to || "lesane1972@gmail.com"
      })
    });
    const j = await r.json();
    const result = { ok: r.ok, status: r.status, id: j.id || null, error: r.ok ? null : (j.message || "unknown") };
    log({ event: "send_email", to: spec.to, subject: spec.subject, result: result });
    return result;
  } catch (e) {
    log({ event: "send_email_failed", to: spec.to, error: e.message });
    return { ok: false, error: e.message };
  }
}

// ─── QUEUE GRANT SUBMISSION ─────────────────────────────────
async function queueGrantSubmission(spec) {
  const decision = envelopes.checkEnvelope("queue_grant_submission", 0, {});
  if (!decision.allowed) {
    return { ok: false, blocked: true, reason: decision.reason };
  }
  const q = loadQueue();
  const item = {
    id: "SUB-" + Date.now(),
    type: "grant_submission",
    grant_name: spec.grant_name,
    funder: spec.funder,
    application_id: spec.application_id,
    submission_url: spec.submission_url,
    status: "READY_FOR_OWNER_SUBMIT",
    created_at: new Date().toISOString(),
    note: "Nia prepared. Owner clicks submit at funder portal."
  };
  q.actions.push(item);
  saveQueue(q);
  log({ event: "queue_grant_submission", item: item });
  return { ok: true, item: item };
}

// ─── REAL ESTATE INQUIRY ────────────────────────────────────
async function sendRealEstateInquiry(spec) {
  const decision = envelopes.checkEnvelope("inquiry_real_estate", 0, {});
  if (!decision.allowed) {
    return { ok: false, blocked: true, reason: decision.reason };
  }
  // Draft the inquiry email
  const body = [
    "Hello,",
    "",
    "I'm Nia, executive AI at House of Jazzu, a Norfolk-based technology company.",
    "We are actively evaluating properties in " + (spec.market || "Hampton Roads") + " for " + (spec.strategy || "cash-flow investment") + ".",
    "",
    "Property: " + (spec.address || "[address]"),
    "Listed price: " + (spec.price || "[price]"),
    "",
    "If this property is still available and the seller is open to a direct offer, please advise.",
    "",
    "Thank you,",
    "Nia",
    "Executive AI, House of Jazzu LLC",
    "757-339-9245 · lesane1972@gmail.com"
  ].join("\n");
  return sendEmail({
    to: spec.agent_email,
    subject: "Inquiry: " + (spec.address || "Hampton Roads property"),
    body: body
  });
}

// ─── DRAFT & QUEUE OUTREACH EMAIL ───────────────────────────
async function draftOutreach(spec) {
  const decision = envelopes.checkEnvelope("draft_outreach", 0, {});
  if (!decision.allowed) {
    return { ok: false, blocked: true, reason: decision.reason };
  }
  const q = loadQueue();
  const item = {
    id: "OUT-" + Date.now(),
    type: "outreach_draft",
    to: spec.to,
    to_name: spec.to_name || null,
    subject: spec.subject || "Grant preparation services for " + (spec.to_name || "your business"),
    body: spec.body,
    status: "READY_FOR_OWNER_APPROVE",
    created_at: new Date().toISOString()
  };
  q.actions.push(item);
  saveQueue(q);
  return { ok: true, item: item };
}

function listQueue(filter) {
  const q = loadQueue();
  let items = q.actions || [];
  if (filter && filter.status) items = items.filter(function (i) { return i.status === filter.status; });
  if (filter && filter.type) items = items.filter(function (i) { return i.type === filter.type; });
  return items;
}

function markSent(id) {
  const q = loadQueue();
  const item = q.actions.find(function (i) { return i.id === id; });
  if (!item) return null;
  item.status = "SENT";
  item.sent_at = new Date().toISOString();
  saveQueue(q);
  log({ event: "queue_item_sent", id: id, type: item.type });
  return item;
}

module.exports = { sendEmail, queueGrantSubmission, sendRealEstateInquiry, draftOutreach, listQueue, markSent };
