const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../../data/pilot-funnel.json");

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

function track(id, stage) {
  const stages = [
    "visitor",
    "interest",
    "signup",
    "activation",
    "mission_complete",
    "returning_user"
  ];

  if (!id || !stages.includes(stage)) {
    throw new Error("INVALID_FUNNEL_EVENT");
  }

  const data = load();

  if (!data[id]) data[id] = { events: [] };

  data[id].events.push({
    stage,
    timestamp: new Date().toISOString()
  });

  save(data);
  return data[id];
}

function metrics() {
  const data = load();
  const counts = {
    visitor: 0,
    interest: 0,
    signup: 0,
    activation: 0,
    mission_complete: 0,
    returning_user: 0
  };

  for (const user of Object.values(data)) {
    const seen = new Set((user.events || []).map(e => e.stage));
    for (const stage of Object.keys(counts)) {
      if (seen.has(stage)) counts[stage]++;
    }
  }

  const conversion = (from, to) =>
    counts[from]
      ? Number(((counts[to] / counts[from]) * 100).toFixed(2))
      : 0;

  return {
    usersTracked: Object.keys(data).length,
    counts,
    conversionRates: {
      visitorToSignup: conversion("visitor", "signup"),
      signupToActivation: conversion("signup", "activation"),
      activationToMission: conversion("activation", "mission_complete"),
      missionToReturning: conversion("mission_complete", "returning_user")
    }
  };
}

module.exports = { track, metrics };
