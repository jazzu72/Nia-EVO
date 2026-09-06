const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../../data/pilot-funnel.json");

function load() {
  if (!fs.existsSync(FILE)) return {};
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch { return {}; }
}

function day(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

function metrics() {
  const data = load();
  const cohorts = {};

  for (const [id, user] of Object.entries(data)) {
    const events = user.events || [];
    if (!events.length) continue;

    const first = events
      .map(e => e.timestamp)
      .sort()[0];

    const cohort = day(first);

    if (!cohorts[cohort]) {
      cohorts[cohort] = {
        users: 0,
        returningUsers: 0,
        missionUsers: 0
      };
    }

    cohorts[cohort].users++;

    const stages = new Set(events.map(e => e.stage));

    if (stages.has("mission_complete"))
      cohorts[cohort].missionUsers++;

    if (stages.has("returning_user"))
      cohorts[cohort].returningUsers++;
  }

  for (const c of Object.values(cohorts)) {
    c.activationRate = c.users
      ? Number(((c.missionUsers / c.users) * 100).toFixed(2))
      : 0;

    c.retentionRate = c.users
      ? Number(((c.returningUsers / c.users) * 100).toFixed(2))
      : 0;
  }

  const values = Object.values(cohorts);

  return {
    cohortCount: values.length,
    cohorts,
    overall: {
      users: values.reduce((n, c) => n + c.users, 0),
      returningUsers: values.reduce((n, c) => n + c.returningUsers, 0),
      retentionRate: values.length
        ? Number((
            values.reduce((n, c) => n + c.returningUsers, 0) /
            Math.max(values.reduce((n, c) => n + c.users, 0), 1) *
            100
          ).toFixed(2))
        : 0
    }
  };
}

module.exports = { metrics };
