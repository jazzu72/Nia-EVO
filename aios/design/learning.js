/*
  NIA LEARNING ENGINE — learns from outcomes, adjusts priorities
  Reads outcomes.jsonl, computes win rates, writes learned-weights.json
  Auto-drafter + revenue plan read the weights to prioritize.
*/

const fs = require("fs");
const path = require("path");

const OUTCOMES_FILE = "runtime/memory/outcomes.jsonl";
const WEIGHTS_FILE = "runtime/memory/learned-weights.json";

function readOutcomes() {
  try {
    if (!fs.existsSync(OUTCOMES_FILE)) return [];
    return fs.readFileSync(OUTCOMES_FILE, "utf8")
      .split("\n").filter(Boolean)
      .map(function (l) { try { return JSON.parse(l); } catch (e) { return null; } })
      .filter(Boolean);
  } catch (e) { return []; }
}

function computeWeights() {
  const outcomes = readOutcomes();
  if (outcomes.length < 3) {
    return {
      status: "INSUFFICIENT_DATA",
      samples: outcomes.length,
      needed: 3 - outcomes.length,
      weights: null,
      by_lane: {},
      by_audience: {},
      best_lane: null,
      worst_lane: null,
    };
  }

  const byLane = {};
  const byAudience = {};
  const byGenerator = {};

  outcomes.forEach(function (o) {
    const lane = o.lane || "unknown";
    const aud = o.audience || "unknown";
    const gen = o.generator || "unknown";
    const won = o.result === "won";

    if (!byLane[lane]) byLane[lane] = { won: 0, lost: 0, total_amount_won: 0 };
    byLane[lane][won ? "won" : "lost"]++;
    if (won) byLane[lane].total_amount_won += Number(o.amount || 0);

    if (!byAudience[aud]) byAudience[aud] = { won: 0, lost: 0 };
    byAudience[aud][won ? "won" : "lost"]++;

    if (!byGenerator[gen]) byGenerator[gen] = { won: 0, lost: 0 };
    byGenerator[gen][won ? "won" : "lost"]++;
  });

  // Compute win rates
  const laneWeights = {};
  Object.keys(byLane).forEach(function (lane) {
    const s = byLane[lane];
    const total = s.won + s.lost;
    laneWeights[lane] = {
      win_rate: total ? s.won / total : 0,
      samples: total,
      total_won_amount: s.total_amount_won,
    };
  });

  // Base weights from revenue-model.json
  let baseModel = null;
  try { baseModel = JSON.parse(fs.readFileSync("config/revenue-model.json", "utf8")); } catch (e) {}
  const baseWeights = {};
  if (baseModel && Array.isArray(baseModel.paths)) {
    baseModel.paths.forEach(function (p) { baseWeights[p.lane] = Number(p.weight) || 0.05; });
  }

  // Adjusted weights: base × (1 + win_rate) — bounded
  const adjusted = {};
  const allLanes = new Set([].concat(
    Object.keys(baseWeights),
    Object.keys(laneWeights)
  ));

  allLanes.forEach(function (lane) {
    const base = baseWeights[lane] || 0.05;
    const lw = laneWeights[lane];
    if (!lw || lw.samples < 2) {
      adjusted[lane] = base;
    } else {
      const multiplier = 1 + (lw.win_rate - 0.15);
      adjusted[lane] = Math.max(0.01, Math.min(0.60, base * multiplier));
    }
  });

  // Normalize to sum 1.0
  const sum = Object.values(adjusted).reduce(function (a, b) { return a + b; }, 0);
  Object.keys(adjusted).forEach(function (k) {
    adjusted[k] = Number((adjusted[k] / sum).toFixed(4));
  });

  // Best/worst
  const ranked = Object.entries(laneWeights)
    .filter(function (kv) { return kv[1].samples >= 2; })
    .sort(function (a, b) { return b[1].win_rate - a[1].win_rate; });

  const result = {
    status: "ACTIVE",
    computed_at: new Date().toISOString(),
    samples: outcomes.length,
    weights: adjusted,
    by_lane: laneWeights,
    by_audience: byAudience,
    by_generator: byGenerator,
    best_lane: ranked[0] ? { lane: ranked[0][0], win_rate: ranked[0][1].win_rate, samples: ranked[0][1].samples } : null,
    worst_lane: ranked[ranked.length - 1] && ranked.length > 1
      ? { lane: ranked[ranked.length - 1][0], win_rate: ranked[ranked.length - 1][1].win_rate, samples: ranked[ranked.length - 1][1].samples }
      : null,
  };

  try {
    const dir = path.dirname(WEIGHTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(WEIGHTS_FILE, JSON.stringify(result, null, 2));
  } catch (e) {}

  return result;
}

function loadWeights() {
  try {
    if (fs.existsSync(WEIGHTS_FILE)) return JSON.parse(fs.readFileSync(WEIGHTS_FILE, "utf8"));
  } catch (e) {}
  return { status: "UNCACHED", weights: null };
}

function buildLearningBlock() {
  const w = loadWeights();
  if (w.status !== "ACTIVE") {
    return "LEARNING: " + (w.status || "unavailable") + " (" + (w.samples || 0) + " outcomes recorded, " + (w.needed || 0) + " more needed)";
  }
  const lines = [
    "LEARNING ACTIVE (" + w.samples + " outcomes recorded):",
    "Current lane weights: " + JSON.stringify(w.weights),
  ];
  if (w.best_lane) lines.push("Best lane: " + w.best_lane.lane + " (" + Math.round(w.best_lane.win_rate * 100) + "% win rate over " + w.best_lane.samples + " samples)");
  if (w.worst_lane) lines.push("Weakest lane: " + w.worst_lane.lane + " (" + Math.round(w.worst_lane.win_rate * 100) + "% win rate)");
  return lines.join("\n");
}

module.exports = { computeWeights, loadWeights, buildLearningBlock, readOutcomes };
