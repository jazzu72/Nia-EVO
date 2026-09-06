const fs = require("fs");
const path = require("path");

const MISSIONS = path.join(__dirname, "../../content/missions/missions.json");

function loadMissions() {
  if (!fs.existsSync(MISSIONS)) return [];
  const data = JSON.parse(fs.readFileSync(MISSIONS, "utf8"));
  return Array.isArray(data) ? data : (data.missions || []);
}

function skillScore(profile, skill) {
  const completed = profile.completedMissions || [];
  return completed.filter(id => String(id).toLowerCase().includes(String(skill).toLowerCase())).length;
}

function recommend(profile = {}) {
  const missions = loadMissions();
  const completed = new Set(profile.completedMissions || []);

  const available = missions.filter(m => {
    const id = m.id || m.missionId;
    return id && !completed.has(id);
  });

  if (!available.length) {
    return {
      status: "COMPLETE",
      reason: "ALL_AVAILABLE_MISSIONS_COMPLETED",
      mission: null
    };
  }

  const scored = available.map(m => {
    const skill = m.skill || m.category || "decision-making";
    return {
      mission: m,
      score: skillScore(profile, skill),
      skill
    };
  });

  scored.sort((a, b) => a.score - b.score);

  return {
    status: "RECOMMENDATION_READY",
    mission: scored[0].mission,
    skill: scored[0].skill,
    reason: "NEXT_UNMASTERED_SKILL"
  };
}

module.exports = {
  loadMissions,
  recommend
};
