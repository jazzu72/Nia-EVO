const express = require("express");
const outcomes = require("../../platform/learning/outcomes-engine");
const fs = require("fs");
const path = require("path");
const store = require("../services/progress-store");

const router = express.Router();

const learningMap = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../content/missions/learning-map.json"),
    "utf8"
  )
);

router.get("/report/:id", (req, res) => {
  const profile = store.getProfile(req.params.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: "PROFILE_NOT_FOUND"
    });
  }

  const completed = new Set(profile.completedMissions || []);

  const missions = learningMap.missions.map(mission => ({
    id: mission.id,
    title: mission.title,
    domain: mission.domain,
    skill: mission.skill,
    objective: mission.objective,
    completed: completed.has(mission.id),
    mastery: completed.has(mission.id) ? "completed" : "not_started"
  }));

  const completedCount = missions.filter(m => m.completed).length;

  res.json({
    success: true,
    learner: {
      id: profile.id,
      displayName: profile.displayName,
      ageBand: profile.ageBand
    },
    progress: {
      completedMissions: completedCount,
      totalMissions: missions.length,
      percentage: Math.round(
        (completedCount / missions.length) * 100
      ),
      sparkCoins: profile.sparkCoins,
      xp: profile.xp
    },
    learning: missions,
    nextRecommendation:
      missions.find(m => !m.completed)?.title ||
      "Starter curriculum complete"
  });
});


router.post("/outcomes", (req, res) => {
  try {
    const { profileId, phase, skills } = req.body || {};

    if (!profileId || !["pre", "post"].includes(phase) || !skills) {
      return res.status(400).json({
        success: false,
        error: "INVALID_OUTCOME_REQUEST"
      });
    }

    const result = outcomes.record(profileId, phase, skills);

    res.status(201).json({
      success: true,
      outcome: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "OUTCOME_RECORD_FAILED"
    });
  }
});

router.get("/outcomes/:profileId", (req, res) => {
  try {
    res.json({
      success: true,
      profileId: req.params.profileId,
      result: outcomes.calculate(req.params.profileId)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "OUTCOME_REPORT_FAILED"
    });
  }
});

module.exports = router;
