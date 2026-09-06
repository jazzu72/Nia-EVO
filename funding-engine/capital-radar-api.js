const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const FILE = path.join(
  process.cwd(),
  "data",
  "capital-radar",
  "opportunities.json"
);

function load() {
  if (!fs.existsSync(FILE)) return { opportunities: [] };
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return { opportunities: [] };
  }
}

function classify(o) {
  if (o.eligibility === "DISQUALIFIED") return "DISQUALIFIED";

  if (
    o.score >= 90 &&
    o.applicationStatus === "NOT_STARTED" &&
    o.eligibility !== "NEEDS_VERIFICATION"
  ) {
    return "APPLY_NOW";
  }

  if (o.score >= 75) return "PREPARE";

  return "WATCH";
}

router.get("/radar", (req, res) => {
  const data = load();

  const opportunities = (data.opportunities || []).map(o => ({
    ...o,
    decision: classify(o),
    humanApprovalRequired: true
  }));

  res.json({
    success: true,
    engine: "NIA_CAPITAL_RADAR",
    objective: "Find and prioritize capital opportunities",
    counts: {
      total: opportunities.length,
      applyNow: opportunities.filter(x => x.decision === "APPLY_NOW").length,
      prepare: opportunities.filter(x => x.decision === "PREPARE").length,
      watch: opportunities.filter(x => x.decision === "WATCH").length,
      disqualified: opportunities.filter(x => x.decision === "DISQUALIFIED").length
    },
    opportunities
  });
});

router.get("/radar/apply-now", (req, res) => {
  const data = load();

  const opportunities = (data.opportunities || [])
    .map(o => ({ ...o, decision: classify(o) }))
    .filter(o => o.decision === "APPLY_NOW");

  res.json({
    success: true,
    count: opportunities.length,
    humanApprovalRequired: true,
    opportunities
  });
});

router.get("/radar/prepare", (req, res) => {
  const data = load();

  const opportunities = (data.opportunities || [])
    .map(o => ({ ...o, decision: classify(o) }))
    .filter(o => o.decision === "PREPARE");

  res.json({
    success: true,
    count: opportunities.length,
    opportunities
  });
});

router.get("/radar/watch", (req, res) => {
  const data = load();

  const opportunities = (data.opportunities || [])
    .map(o => ({ ...o, decision: classify(o) }))
    .filter(o => o.decision === "WATCH");

  res.json({
    success: true,
    count: opportunities.length,
    opportunities
  });
});

module.exports = router;
