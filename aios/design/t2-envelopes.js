/*
  NIA T2.5 BOUNDED ENVELOPES
  Owner-signed, revocable, time-bounded, amount-capped execution authority.
  Nia can act WITHOUT per-action approval, but ONLY inside a signed envelope.
*/

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ENVELOPES_FILE = process.env.ENVELOPES_FILE || "config/envelopes.json";
const AUDIT_FILE = process.env.ENVELOPE_AUDIT_FILE || "runtime/envelope-audit.log";

function readEnvelopes() {
  try {
    const raw = fs.readFileSync(ENVELOPES_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data.envelopes) ? data : { envelopes: [] };
  } catch (e) {
    return { envelopes: [] };
  }
}

function writeEnvelopes(data) {
  const dir = path.dirname(ENVELOPES_FILE);
  if (dir && dir !== ".") fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ENVELOPES_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
}

function hashEnvelope(env) {
  const c = JSON.stringify({
    id: env.id,
    actions: env.actions,
    max_per_transaction: env.max_per_transaction,
    max_per_period: env.max_per_period,
    period_days: env.period_days,
    criteria: env.criteria,
    expires_at: env.expires_at,
    signed_at: env.signed_at,
  });
  return crypto.createHash("sha256").update(c).digest("hex");
}

function appendAudit(entry) {
  try {
    const dir = path.dirname(AUDIT_FILE);
    if (dir && dir !== ".") fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(AUDIT_FILE, JSON.stringify(Object.assign({ ts: new Date().toISOString() }, entry)) + "\n");
  } catch (e) {}
}

function signEnvelope(spec, ownerToken) {
  if (!ownerToken) throw new Error("owner token required");
  const expected = process.env.NIA_OWNER_AUTH_TOKEN;
  if (!expected || ownerToken !== expected) throw new Error("owner token mismatch");

  const now = new Date().toISOString();
  const days = Number(spec.period_days) || 30;
  const expires = new Date(Date.now() + days * 86400000).toISOString();
  const id = "ENV-" + Date.now() + "-" + crypto.randomBytes(4).toString("hex");

  const env = {
    id: id,
    created_at: now,
    signed_at: now,
    signer: "owner",
    status: "ACTIVE",
    actions: Array.isArray(spec.actions) && spec.actions.length ? spec.actions : ["draft_proposal"],
    max_per_transaction: Number(spec.max_per_transaction) || 0,
    max_per_period: Number(spec.max_per_period) || 0,
    period_days: days,
    expires_at: expires,
    criteria: spec.criteria || {},
    revoked_at: null,
    revoke_reason: null,
    execution_count: 0,
    amount_used_period: 0,
    period_start: now,
    signature: null,
  };
  env.signature = hashEnvelope(env);

  const data = readEnvelopes();
  data.envelopes.push(env);
  writeEnvelopes(data);
  appendAudit({ event: "envelope_signed", envelope_id: id, actions: env.actions, max_per_transaction: env.max_per_transaction, max_per_period: env.max_per_period, expires_at: env.expires_at, signature: env.signature });
  return env;
}

function revokeEnvelope(id, reason) {
  const data = readEnvelopes();
  const env = data.envelopes.find(function (e) { return e.id === id; });
  if (!env) throw new Error("envelope not found");
  if (env.status === "REVOKED") throw new Error("already revoked");
  env.status = "REVOKED";
  env.revoked_at = new Date().toISOString();
  env.revoke_reason = reason || "owner requested";
  writeEnvelopes(data);
  appendAudit({ event: "envelope_revoked", envelope_id: id, reason: env.revoke_reason });
  return env;
}

function listEnvelopes() {
  const data = readEnvelopes();
  const now = Date.now();
  return data.envelopes.map(function (e) {
    const expired = new Date(e.expires_at).getTime() < now;
    return Object.assign({}, e, { effective_status: e.status === "REVOKED" ? "REVOKED" : (expired ? "EXPIRED" : "ACTIVE") });
  });
}

function checkEnvelope(action, amount, context) {
  amount = Number(amount) || 0;
  context = context || {};
  const data = readEnvelopes();
  const now = Date.now();

  const candidates = data.envelopes.filter(function (e) {
    if (e.status !== "ACTIVE") return false;
    if (new Date(e.expires_at).getTime() < now) return false;
    if (e.actions.indexOf(action) === -1) return false;
    if (amount > 0 && amount > Number(e.max_per_transaction || 0)) return false;
    if (e.criteria && e.criteria.lane && context.lane && e.criteria.lane !== context.lane) return false;
    if (e.criteria && typeof e.criteria.min_confidence === "number" && typeof context.confidence === "number") {
      if (context.confidence < e.criteria.min_confidence) return false;
    }
    return true;
  });

  if (!candidates.length) return { allowed: false, reason: "NO_ENVELOPE", action: action, amount: amount };

  const env = candidates[0];
  const periodStart = new Date(env.period_start).getTime();
  const periodMs = Number(env.period_days || 30) * 86400000;
  const used = (now - periodStart) < periodMs ? Number(env.amount_used_period || 0) : 0;
  if (amount > 0 && (used + amount) > Number(env.max_per_period || 0)) {
    return { allowed: false, reason: "PERIOD_LIMIT_EXCEEDED", envelope_id: env.id, used: used, limit: env.max_per_period };
  }
  return { allowed: true, envelope_id: env.id, action: action, amount: amount, remaining_period: Number(env.max_per_period || 0) - used - amount, expires_at: env.expires_at };
}

function recordExecution(envelope_id, action, amount, result) {
  const data = readEnvelopes();
  const env = data.envelopes.find(function (e) { return e.id === envelope_id; });
  if (!env) return null;
  env.execution_count = Number(env.execution_count || 0) + 1;
  const now = Date.now();
  const periodStart = new Date(env.period_start).getTime();
  const periodMs = Number(env.period_days || 30) * 86400000;
  if ((now - periodStart) >= periodMs) { env.period_start = new Date().toISOString(); env.amount_used_period = Number(amount) || 0; }
  else { env.amount_used_period = Number(env.amount_used_period || 0) + (Number(amount) || 0); }
  writeEnvelopes(data);
  appendAudit({ event: "envelope_execution", envelope_id: envelope_id, action: action, amount: Number(amount) || 0, result: result || "recorded", execution_count: env.execution_count });
  return env;
}

module.exports = { signEnvelope, revokeEnvelope, listEnvelopes, checkEnvelope, recordExecution };
