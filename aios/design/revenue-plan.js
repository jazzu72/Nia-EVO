/*
  NIA REVENUE PLAN ENGINE
  Reads config/revenue-model.json + live capital engine.
  Produces a weighted plan showing which moves get to target fastest.
*/

const fs = require("fs");
const path = require("path");

const MODEL_FILE = process.env.REVENUE_MODEL || "config/revenue-model.json";

let engine = null;
try { engine = require(path.join(__dirname, "..", "capital", "parallel-capital-engine")); } catch (e) {}

function loadModel() {
  try { return JSON.parse(fs.readFileSync(MODEL_FILE, "utf8")); }
  catch (e) { return null; }
}

function daysBetween(a, b) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

function laneWeight(model, lane) {
  const p = (model.paths || []).find(function (x) { return x.lane === lane; });
  return p ? Number(p.weight) : 0.05;
}

function laneVelocity(model, lane) {
  const p = (model.paths || []).find(function (x) { return x.lane === lane; });
  return p ? Number(p.velocity_days) : 180;
}

async function buildPlan() {
  const model = loadModel();
  if (!model) return { ok: false, error: "revenue_model_missing" };

  const now = new Date();
  const deadlineDays = daysBetween(now, model.target.deadline);

  let opportunities = [];
  try {
    if (engine) {
      const sources = await engine.getLiveCapitalSources();
      const result = await engine.discover(sources);
      opportunities = result.opportunities || [];
    }
  } catch (e) {}

  const minConf = model.constraints.min_confidence || 0;
  const filtered = opportunities.filter(function (o) {
    return Number(o.probability || 0) >= minConf;
  });

  // Score each opportunity: amount × weight × confidence × velocity factor
  const scored = filtered.map(function (o) {
    const w = laneWeight(model, o.lane);
    const v = laneVelocity(model, o.lane);
    const amount = Number(o.amount || 0);
    const prob = Number(o.probability || 0);
    // Earlier velocity = better. Score = amount × prob × weight × (deadlineDays / velocity)
    const velocityFactor = Math.min(3, deadlineDays / Math.max(30, v));
    const score = amount * prob * w * velocityFactor;
    return {
      id: o.id,
      name: o.organization || o.title,
      lane: o.lane,
      amount: amount,
      confidence: Math.round(prob * 100),
      velocity_days: v,
      weight: w,
      weighted_score: Math.round(score),
    };
  }).sort(function (a, b) { return b.weighted_score - a.weighted_score; });

  const top10 = scored.slice(0, 10);

  // Lane summary
  const laneSummary = {};
  (model.paths || []).forEach(function (p) {
    const laneOpps = filtered.filter(function (o) { return o.lane === p.lane; });
    const totalAmount = laneOpps.reduce(function (s, o) { return s + Number(o.amount || 0); }, 0);
    const expected = laneOpps.reduce(function (s, o) { return s + Number(o.amount || 0) * Number(o.probability || 0); }, 0);
    laneSummary[p.lane] = {
      weight: p.weight,
      velocity_days: p.velocity_days,
      opportunities: laneOpps.length,
      pipeline: totalAmount,
      expected_value: Math.round(expected),
    };
  });

  // Progress calc
  const expectedTotal = scored.reduce(function (s, o) { return s + o.amount * (o.confidence / 100); }, 0);
  const targetAmount = model.target.amount;
  const gap = Math.max(0, targetAmount - expectedTotal);
  const progressPct = Math.min(100, Math.round((expectedTotal / targetAmount) * 100));

  // Recommendation: which lane to prioritize now based on weight × expected value ÷ velocity
  const lanePriority = Object.entries(laneSummary).map(function (kv) {
    const lane = kv[0];
    const s = kv[1];
    const priority = (s.weight * s.expected_value) / Math.max(1, s.velocity_days);
    return { lane: lane, priority: Math.round(priority), expected: s.expected_value, velocity_days: s.velocity_days };
  }).sort(function (a, b) { return b.priority - a.priority; });

  return {
    ok: true,
    model: {
      target: model.target,
      deadline_days_remaining: deadlineDays,
      hard_floor: model.target.hard_floor,
    },
    progress: {
      expected_total: Math.round(expectedTotal),
      target: targetAmount,
      gap: gap,
      progress_pct: progressPct,
      on_track: progressPct >= Math.round((1 - deadlineDays / 365) * 100),
    },
    top_opportunities: top10,
    by_lane: laneSummary,
    lane_priority: lanePriority,
    generated_at: now.toISOString(),
  };
}

module.exports = { buildPlan };
