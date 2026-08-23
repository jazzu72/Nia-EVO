const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../../data/progress.json");

function load() {
  if (!fs.existsSync(FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
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

  data[id] = {
    id,
    displayName,
    ageBand: "8-11",
    sparkCoins: 0,
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

  profile.completedMissions.push(missionId);
  profile.sparkCoins += reward;
  profile.xp += reward;

  save(data);
  return profile;
}

module.exports = {
  load,
  getProfile,
  createProfile,
  completeMission
};
