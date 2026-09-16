const fs = require("fs");
const path = require("path");

async function handleStatus(req, res) {
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

  let memory = null;
  try { memory = require("../design/nia-memory"); } catch (e) {}

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
  try { status.capabilities.brand = "Warhol identity metrics (6 dimensions)"; } catch (e) {}

  try {
    if (memory) {
      const convos = memory.readRecent("runtime/memory/conversations.jsonl", 30);
      const decisions = memory.readRecent("runtime/memory/decisions.jsonl", 30);
      status.memory = {
        conversations_last_30d: convos.length,
        decisions_last_30d: decisions.length,
      };
    }
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
}

module.exports = { handleStatus: handleStatus };
