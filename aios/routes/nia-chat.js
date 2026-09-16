const express = require("express");
const path = require("path");
const router = express.Router();
const llm = require("../../tools/llm");
const gate = require("../../tools/autonomy-gate");
const warhol = require("../design/warhol-identity-metrics");
const memory = require("../design/nia-memory");
const learning = require("../design/learning");
const relationships = require("../design/relationships");

let engine = null;
try { engine = require(path.join(__dirname, "..", "capital", "parallel-capital-engine")); } catch (e) {}

const NL = String.fromCharCode(10);
let __ctxCache = null;
let __ctxCacheAt = 0;
const CTX_TTL = 60000;
const MAX_LEN = 2000;

const SYSTEM = "You are NIA, the governed capital-intelligence assistant for House of Jazzu. Be direct and concise. Use only LIVE CONTEXT for numbers. Never invent facts. Financial execution is permanently blocked. Owner signature is required for submission. If WARHOL IDENTITY METRICS are supplied, use them to critique the pitch: cite strengths and gaps, propose specific improvements. Do not claim audience or conversion data.";

async function buildContext() {
  if (__ctxCache && (Date.now() - __ctxCacheAt) < CTX_TTL) return __ctxCache;
  const result = await _buildContextInner();
  __ctxCache = result;
  __ctxCacheAt = Date.now();
  return result;
}

async function _buildContextInner() {
  const ctx = { capital: null, autonomy: "unknown" };
  try {
    if (engine) {
      const sources = await engine.getLiveCapitalSources();
      const result = await engine.discover(sources);
      ctx.capital = {
        opportunities: result.summary.total_opportunities,
        total: result.summary.total_amount,
        byLane: result.summary.by_lane,
        top: (result.opportunities || []).slice(0, 5).map(function (o) {
          return { id: o.id, name: o.organization || o.title, lane: o.lane, amount: o.amount, confidence: Math.round((o.probability || 0) * 100) };
        }),
      };
    }
  } catch (e) {}
  try { ctx.autonomy = gate.loadConfig().mode; } catch (e) {}
  return ctx;
}

function ctxBlock(ctx) {
  if (!ctx.capital) return "Live capital: unavailable. Autonomy: " + ctx.autonomy;
  const lines = [
    "Live capital: " + ctx.capital.opportunities + " opportunities, $" + ctx.capital.total.toLocaleString(),
    "By lane: " + JSON.stringify(ctx.capital.byLane),
  ];
  if (ctx.capital.top.length) {
    lines.push("Top opportunities:");
    ctx.capital.top.forEach(function (o) {
      lines.push("- " + o.id + " | " + o.name + " | " + o.lane + " | $" + o.amount + " | " + o.confidence + "%");
    });
  }
  lines.push("Autonomy: " + ctx.autonomy + ". Financial execution: BLOCKED. Owner signature: REQUIRED.");
  return lines.join(NL);
}

router.post("/chat", async function (req, res) {
  const message = String((req.body || {}).message || "").trim();
  if (!message) return res.status(400).json({ ok: false, error: "message_required" });
  if (message.length > MAX_LEN) return res.status(413).json({ ok: false, error: "message_too_long", maxLength: MAX_LEN });

  const ctx = await buildContext();
  const memoryBlock = memory.buildMemoryBlock(90);
  const learningBlock = learning.buildLearningBlock();
  const relationshipsBlock = ctx.capital ? relationships.buildRelationshipBlock([]) : "";

  const identityArtifact = (req.body || {}).identityArtifact && typeof req.body.identityArtifact === "object" ? req.body.identityArtifact : null;
  const identityMetrics = identityArtifact ? warhol.evaluateIdentityArtifact(identityArtifact) : null;
  const identityBlock = identityMetrics ? NL + NL + "WARHOL IDENTITY METRICS (owner-supplied):" + NL + warhol.summarizeForPrompt(identityMetrics) : "";

  const prompt = [SYSTEM, "", ctxBlock(ctx), memoryBlock ? ("PRIOR CONTEXT:\n" + memoryBlock) : "", relationshipsBlock, identityBlock, "", "OWNER MESSAGE:", message].join(NL);

  const result = await llm.generate(prompt, function () {
    const total = ctx.capital ? ctx.capital.total : 0;
    const opps = ctx.capital ? ctx.capital.opportunities : 0;
    return "Request: " + message.slice(0, 150) + ". Pipeline: " + opps + " opps, $" + total.toLocaleString() + ". " + (identityMetrics ? "Warhol score: " + identityMetrics.overall + "/100. " : "") + "(LLM unavailable; template response.)";
  });

  memory.recordTurn("user", message);
  memory.recordTurn("nia", (result.text || "").slice(0, 500), { generator: result.generator });
  console.log(JSON.stringify({ component: "nia-chat", event: "chat_completed", generator: result.generator || "template", identityUsed: Boolean(identityMetrics) }));

  res.json({
    ok: true,
    reply: result.text,
    generator: result.generator || "template",
    provider: result.provider || null,
    model: result.model || null,
    fallback: Boolean(result.fallback),
    errorCategory: result.errorCategory || null,
    context: ctx.capital ? { opportunities: ctx.capital.opportunities, total: ctx.capital.total } : null,
    identityMetrics: identityMetrics ? {
      framework: identityMetrics.framework,
      overall: identityMetrics.overall,
      scores: identityMetrics.scores,
      strengths: identityMetrics.strengths,
      gaps: identityMetrics.gaps,
    } : null,
    timestamp: new Date().toISOString(),
  });
});



// ─── GET /status — full Nia self-awareness ───────────────────
router.get("/status", async function (req, res) {
  const fs = require("fs");
  const path = require("path");
  const memory = require("../design/nia-memory");
const learning = require("../design/learning");

  const status = {
    ok: true,
    nia: "governed autonomous capital intelligence",
    timestamp: new Date().toISOString(),
    capabilities: {},
    memory: {},
    envelopes: {},
    system: {},
  };

  let engine = null;
  try { engine = require(path.join(__dirname, "..", "capital", "parallel-capital-engine")); } catch (e) {}

  try {
    if (engine) {
      const sources = await engine.getLiveCapitalSources();
      const result = await engine.discover(sources);
      status.capabilities.capital = {
        opportunities: result.summary.total_opportunities,
        total_amount: result.summary.total_amount,
        lanes: Object.keys(result.summary.by_lane || {}).length,
      };
    }
  } catch (e) { status.capabilities.capital = { error: e.message }; }

  try { status.capabilities.design = require("../design/vitruvian-ui-ux").listLenses().length + " lenses"; } catch (e) { status.capabilities.design = "unavailable"; }
  status.capabilities.brand = "Warhol identity metrics (6 dimensions)";

  try {
    const convos = memory.readRecent("runtime/memory/conversations.jsonl", 30);
    const decisions = memory.readRecent("runtime/memory/decisions.jsonl", 30);
    status.memory = {
      conversations_last_30d: convos.length,
      decisions_last_30d: decisions.length,
    };
  } catch (e) {}

  try {
    const env = require("../design/t2-envelopes");
    const list = env.listEnvelopes();
    status.envelopes = {
      total: list.length,
      active: list.filter(function (e) { return e.effective_status === "ACTIVE"; }).length,
      revoked: list.filter(function (e) { return e.effective_status === "REVOKED"; }).length,
    };
  } catch (e) {}

  try {
    const outcomesPath = "runtime/memory/outcomes.jsonl";
    const outcomes = fs.existsSync(outcomesPath)
      ? fs.readFileSync(outcomesPath, "utf8").split("\n").filter(Boolean).length
      : 0;
    status.system = {
      outcome_records: outcomes,
      weekly_brief_available: fs.existsSync("runtime/memory/briefs/latest.json"),
      safety: {
        t4_financial_execution: "PERMANENTLY_BLOCKED",
        owner_signature: "REQUIRED",
        evidence_gate: "ENFORCED",
      },
    };
  } catch (e) {}

  res.json(status);
});

module.exports = router;
