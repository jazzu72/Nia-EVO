const express = require("express");
const path = require("path");
const router = express.Router();

let engine = null;
try { engine = require(path.join(__dirname, "..", "aios", "capital", "parallel-capital-engine")); } catch (e) {}

router.get("/", async (req, res) => {
  let summary = {};
  try {
    if (engine) {
      const sources = await engine.getLiveCapitalSources();
      const result = await engine.discover(sources);
      summary = result.summary || {};
    }
  } catch (e) {}

  res.json({
    ok: true,
    service: "executive-dashboard-api",
    mode: "READ_ONLY",
    execution_allowed: false,
    autonomous_execution: false,
    human_approval_required: true,
    summary: {
      opportunities: summary.total_opportunities || 0,
      total_amount: summary.total_amount || 0,
      by_lane: summary.by_lane || {},
    },
    timestamp: new Date().toISOString(),
  });
});

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "executive-dashboard-api", status: "ONLINE" });
});

module.exports = router;
