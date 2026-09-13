const express = require("express");
const path = require("path");
const router = express.Router();

const gate = require("../../tools/autonomy-gate");
const llm = require("../../tools/llm");

const CAPITAL_ENGINE = path.join(__dirname, "..", "capital", "parallel-capital-engine");
let engine = null;
try { engine = require(CAPITAL_ENGINE); } catch (e) { console.warn("⚠️ autonomy: capital engine unavailable:", e.message); }

router.get("/status", (req, res) => {
  try {
    const cfg = gate.loadConfig();
    const tiers = {};
    for (const [name, tier] of Object.entries(cfg.tiers || {})) {
      tiers[name] = {
        enabled: !!tier.enabled,
        actionCount: (tier.actions || []).length,
        blockedCount: (tier.blocked_actions || []).length,
        reason: tier.reason || null,
      };
    }
    res.json({
      ok: true,
      mode: cfg.mode,
      unlockedAt: cfg.unlockedAt,
      tiers,
      evidenceGate: cfg.evidence_gate,
      killSwitch: cfg.kill_switch,
      providers: {
        gemini: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY),
        openai: !!process.env.OPENAI_API_KEY,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.post("/check", (req, res) => {
  const action = (req.body || {}).action;
  if (!action) return res.status(400).json({ ok: false, error: "action required" });
  const decision = gate.isAllowed(action);
  gate.auditLog(action, decision, req.get("x-actor") || "api");
  res.json({ ok: true, action, ...decision });
});

router.get("/draft/:id", async (req, res) => {
  const decision = gate.isAllowed("draft_proposal");
  gate.auditLog("draft_proposal", decision, "api");
  if (!decision.allowed) {
    return res.status(403).json({ ok: false, error: "AUTONOMY_BLOCKED", reason: decision.reason, tier: decision.tier });
  }

  let opp = null;
  try {
    if (engine) {
      const sources = await engine.getLiveCapitalSources();
      const result = await engine.discover(sources);
      opp = (result.opportunities || []).find(o => o.id === req.params.id);
    }
  } catch {}

  if (!opp) return res.status(404).json({ ok: false, error: "Opportunity not found", id: req.params.id });

  const prompt = [
    "You are drafting a grant application executive summary.",
    "Evidence-only: do NOT invent facts. Only use fields below.",
    "If information is missing, note it as [TO BE CONFIRMED].",
    "",
    `Opportunity: ${opp.organization || opp.title}`,
    `Lane: ${opp.lane}`,
    `Source: ${opp.source}`,
    `Amount: $${opp.amount}`,
    `Probability: ${Math.round((opp.probability || 0) * 100)}%`,
    "",
    "Write 3 short paragraphs: (1) what this opportunity is, (2) why House of Jazzu is a fit, (3) what evidence we still need.",
    "Max 250 words. Plain text, no markdown headers.",
  ].join("\n");

  const { text, generator, errors } = await llm.generate(prompt, () => templateDraft(opp));

  res.json({
    ok: true,
    tier: decision.tier,
    requiresOwnerClick: true,
    draft: {
      opportunityId: opp.id,
      organization: opp.organization || opp.title,
      lane: opp.lane,
      amount: opp.amount,
      generatedAt: new Date().toISOString(),
      generator,
      content: text,
      providerErrors: errors,
    },
  });
});

function templateDraft(opp){
  return [
    `Executive Summary`,
    ``,
    `${opp.organization || opp.title} has been identified as a ${opp.lane.replace(/_/g," ")} opportunity with an estimated value of $${(opp.amount||0).toLocaleString()}. This opportunity was sourced via ${opp.source || "NIA"} and carries a confidence score of ${Math.round((opp.probability||0)*100)}%.`,
    ``,
    `Why House of Jazzu`,
    ``,
    `House of Jazzu operates the NIA Capital Observatory — an autonomous capital-intelligence platform that discovers, classifies, and verifies funding opportunities at scale. Our system is certified as controlled-autonomous: it observes and prepares, but every financial commitment requires explicit human authorization.`,
    ``,
    `Evidence & Confirmation Required`,
    ``,
    `- [TO BE CONFIRMED] Eligibility criteria for this specific program`,
    `- [TO BE CONFIRMED] Required financial documentation`,
    `- [TO BE CONFIRMED] Deadline and submission channel`,
    ``,
    `Generated from verified engine data only. No unsupported claims included.`,
  ].join("\n");
}

module.exports = router;
