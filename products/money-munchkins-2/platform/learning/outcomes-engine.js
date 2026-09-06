const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../../data/learning-outcomes.json");

function load() {
  if (!fs.existsSync(FILE)) return {};
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch { return {}; }
}

function save(data) {
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, FILE);
}

function record(profileId, phase, skills = {}) {
  if (!profileId || !["pre", "post"].includes(phase)) {
    throw new Error("INVALID_OUTCOME_RECORD");
  }

  const data = load();

  if (!data[profileId]) {
    data[profileId] = { pre: {}, post: {} };
  }

  data[profileId][phase] = {
    ...skills,
    recordedAt: new Date().toISOString()
  };

  save(data);
  return data[profileId];
}

function calculate(profileId) {
  const data = load()[profileId];

  if (!data || !Object.keys(data.pre).length || !Object.keys(data.post).length) {
    return {
      status: "INSUFFICIENT_DATA",
      improvementRate: null
    };
  }

  const skills = new Set([
    ...Object.keys(data.pre),
    ...Object.keys(data.post)
  ]);

  let before = 0;
  let after = 0;
  let count = 0;

  for (const skill of skills) {
    if (typeof data.pre[skill] === "number" &&
        typeof data.post[skill] === "number") {
      before += data.pre[skill];
      after += data.post[skill];
      count++;
    }
  }

  if (!count) {
    return {
      status: "INSUFFICIENT_DATA",
      improvementRate: null
    };
  }

  const avgBefore = before / count;
  const avgAfter = after / count;

  return {
    status: "MEASURED",
    skillsMeasured: count,
    averagePreScore: Number(avgBefore.toFixed(2)),
    averagePostScore: Number(avgAfter.toFixed(2)),
    improvementRate: Number(
      (((avgAfter - avgBefore) / Math.max(avgBefore, 1)) * 100).toFixed(2)
    )
  };
}

module.exports = { load, save, record, calculate };
