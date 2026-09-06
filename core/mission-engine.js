const fs = require("fs");
const path = require("path");

const MEM_PATH = path.join(process.env.HOME, ".nia-complete", "missions.json");

function ensure() {
  if (!fs.existsSync(MEM_PATH)) {
    fs.mkdirSync(path.dirname(MEM_PATH), { recursive: true });
    fs.writeFileSync(MEM_PATH, JSON.stringify({ missions: [] }, null, 2));
  }
}

function load() {
  ensure();
  return JSON.parse(fs.readFileSync(MEM_PATH, "utf8"));
}

function save(data) {
  fs.writeFileSync(MEM_PATH, JSON.stringify(data, null, 2));
}

function computePriority(m) {
  const impactW = 0.30;
  const urgencyW = 0.25;
  const roiW = 0.20;
  const riskW = -0.15;
  const effortW = -0.10;

  return (
    (m.impact || 3) * impactW +
    (m.urgency || 3) * urgencyW +
    (m.roi || 3) * roiW +
    (m.risk || 3) * riskW +
    (m.effort || 3) * effortW
  );
}

function createMissionBase(name, description, steps = []) {
  const data = load();
  const mission = {
    id: Date.now().toString(),
    name,
    description,
    steps: steps.map((s, i) => ({ id: i + 1, text: s, done: false })),
    created: new Date().toISOString(),
    status: "active",
    impact: 3,
    urgency: 3,
    effort: 3,
    risk: 3,
    roi: 3
  };
  mission.priorityScore = computePriority(mission);
  data.missions.push(mission);
  save(data);
  return mission;
}

module.exports = {
  createMission(name, description, steps = [], meta = {}) {
    const mission = createMissionBase(name, description, steps);
    mission.impact = meta.impact || 3;
    mission.urgency = meta.urgency || 3;
    mission.effort = meta.effort || 3;
    mission.risk = meta.risk || 3;
    mission.roi = meta.roi || 3;
    mission.priorityScore = computePriority(mission);

    const data = load();
    const idx = data.missions.findIndex(m => m.id === mission.id);
    data.missions[idx] = mission;
    save(data);
    return mission;
  },

  listMissions() {
    return load().missions;
  },

  completeStep(missionId, stepId) {
    const data = load();
    const mission = data.missions.find(m => m.id === missionId);
    if (!mission) return null;

    const step = mission.steps.find(s => s.id === stepId);
    if (!step) return null;

    step.done = true;
    if (mission.steps.every(s => s.done)) {
      mission.status = "completed";
    }
    mission.priorityScore = computePriority(mission);

    save(data);
    return mission;
  },

  getMission(id) {
    return load().missions.find(m => m.id === id);
  },

  computePriority
};
