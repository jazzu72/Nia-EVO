const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const learning = require("../design/learning");

const OUTCOMES_FILE = "runtime/memory/outcomes.jsonl";

function appendOutcome(o) {
  const dir = path.dirname(OUTCOMES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(OUTCOMES_FILE, JSON.stringify(o) + "\n");
}

function readOutcomes() {
  try {
    if (!fs.existsSync(OUTCOMES_FILE)) return [];
    return fs.readFileSync(OUTCOMES_FILE, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
  } catch (e) { return []; }
}

function stats() {
  const outcomes = readOutcomes();
  const byLane = {};
  const byAudience = {};
  outcomes.forEach(o => {
    const lane = o.lane || "unknown";
    if (!byLane[lane]) byLane[lane] = { won: 0, lost: 0 };
    byLane[lane][o.result === "won" ? "won" : "lost"]++;
    const aud = o.audience || "unknown";
    if (!byAudience[aud]) byAudience[aud] = { won: 0, lost: 0 };
    byAudience[aud][o.result === "won" ? "won" : "lost"]++;
  });
  const total = outcomes.length;
  const wins = outcomes.filter(o => o.result === "won").length;
  return {
    total: total,
    wins: wins,
    losses: total - wins,
    win_rate: total ? Math.round((wins / total) * 100) : 0,
    by_lane: byLane,
    by_audience: byAudience,
  };
}

router.post("/:draftId", (req, res) => {
  const body = req.body || {};
  const outcome = {
    ts: new Date().toISOString(),
    draft_id: req.params.draftId,
    result: body.result === "won" ? "won" : "lost",
    lane: String(body.lane || "").slice(0, 40),
    audience: String(body.audience || "").slice(0, 80),
    amount: Number(body.amount) || 0,
    reason: String(body.reason || "").slice(0, 500),
  };
  appendOutcome(outcome);
  const learned = learning.computeWeights();
  res.json({ ok: true, outcome: outcome, stats: stats(), learning: { status: learned.status, samples: learned.samples, best_lane: learned.best_lane } });
});

router.get("/stats", (req, res) => {
  res.json({ ok: true, stats: stats() });
});

router.get("/weights", function (req, res) {
  const w = learning.computeWeights();
  res.json({ ok: true, learning: w });
});

module.exports = router;
