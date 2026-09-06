const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../../data/progress.json");
const EVENTS = path.join(__dirname, "../../data/investor-events.json");

function recordEvent(type, profileId, metadata = {}) {
  let events = [];
  if (fs.existsSync(EVENTS)) {
    try { events = JSON.parse(fs.readFileSync(EVENTS, "utf8")); } catch {}
  }
  events.push({
    type,
    profileId,
    metadata,
    timestamp: new Date().toISOString()
  });
  const tmp = EVENTS + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(events, null, 2));
  fs.renameSync(tmp, EVENTS);
}

function load() {
  if (!fs.existsSync(FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

function recordActivity(id) {
  const data = load();
  const profile = data[id];
  if (!profile) return null;

  profile.lastActiveAt = new Date().toISOString();
  profile.sessions = (profile.sessions || 0) + 1;
  save(data);
  return profile;
}

function save(data) {
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, FILE);
}

function getProfile(id) {
  return load()[id] || null;
}

function createProfile({ id, displayName }) {
  const data = load();

  if (data[id]) throw new Error("PROFILE_ALREADY_EXISTS");

  recordEvent("profile_created", id);
  data[id] = {
    id,
    displayName,
    ageBand: "8-11",
    sparkCoins: 0,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    sessions: 0,
    xp: 0,
    completedMissions: [],
    dailyMissionDate: null,
    dailyMissionCount: 0,
    dailyMissionLimit: 3,
    createdAt: new Date().toISOString()
  };

  save(data);
  return data[id];
}

function completeMission(id, missionId, reward = 10) {
  const data = load();
  const profile = data[id];

  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  if (profile.completedMissions.includes(missionId)) {
    throw new Error("MISSION_ALREADY_COMPLETED");
  }

  const today = new Date().toISOString().slice(0, 10);
  if (profile.dailyMissionDate !== today) {
    profile.dailyMissionDate = today;
    profile.dailyMissionCount = 0;
  }

  const dailyLimit = Number(profile.dailyMissionLimit || 3);
  if (profile.dailyMissionCount >= dailyLimit) {
    throw new Error("DAILY_MISSION_LIMIT_REACHED");
  }

  profile.completedMissions.push(missionId);
  profile.dailyMissionCount += 1;
    recordEvent("mission_completed", id, {
      missionId,
      reward
    });
  profile.sparkCoins += reward;
  profile.xp += reward;

  save(data);
  return profile;
}

module.exports = {
  recordActivity,
  load,
  getProfile,
  createProfile,
  completeMission,
  recordEvent
};
