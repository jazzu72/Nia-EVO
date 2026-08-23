const express = require("express");
const store = require("../services/progress-store");

const router = express.Router();

router.post("/profiles", (req, res) => {
  try {
    const { id, displayName } = req.body || {};

    if (!id || !displayName) {
      return res.status(400).json({
        success: false,
        error: "ID_AND_DISPLAY_NAME_REQUIRED"
      });
    }

    const profile = store.createProfile({ id, displayName });

    res.status(201).json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(409).json({
      success: false,
      error: error.message
    });
  }
});

router.get("/profiles/:id", (req, res) => {
  const profile = store.getProfile(req.params.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: "PROFILE_NOT_FOUND"
    });
  }

  res.json({ success: true, profile });
});

router.post("/profiles/:id/missions/:missionId/complete", (req, res) => {
  try {
    const reward = Number(req.body.reward || 10);

    if (!Number.isFinite(reward) || reward <= 0) {
      return res.status(400).json({
        success: false,
        error: "INVALID_REWARD"
      });
    }

    const profile = store.completeMission(
      req.params.id,
      req.params.missionId,
      reward
    );

    res.json({
      success: true,
      message: "MISSION_COMPLETED",
      profile
    });
  } catch (error) {
    const status = error.message === "DAILY_MISSION_LIMIT_REACHED" ? 429 : 404;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
