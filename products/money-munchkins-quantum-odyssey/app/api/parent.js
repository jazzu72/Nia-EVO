const express = require("express");
const crypto = require("crypto");
const store = require("../services/progress-store");

const router = express.Router();
const sessions = new Map();

router.post("/gate", (req, res) => {
  const { parentCode } = req.body || {};

  const configuredCode = process.env.MONEY_MUNCHKINS_PARENT_CODE;

  if (!configuredCode) {
    return res.status(503).json({
      success: false,
      error: "PARENT_GATE_NOT_CONFIGURED"
    });
  }

  if (!parentCode || String(parentCode) !== String(configuredCode)) {
    return res.status(401).json({
      success: false,
      error: "INVALID_PARENT_CODE"
    });
  }

  const token = crypto.randomBytes(24).toString("hex");

  sessions.set(token, {
    expiresAt: Date.now() + 30 * 60 * 1000
  });

  res.json({
    success: true,
    parentToken: token,
    expiresInMinutes: 30
  });
});

router.get("/progress/:id", (req, res) => {
  const token = req.headers["x-parent-token"];
  const session = sessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({
      success: false,
      error: "PARENT_GATE_REQUIRED"
    });
  }

  const profile = store.getProfile(req.params.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: "PROFILE_NOT_FOUND"
    });
  }

  res.json({
    success: true,
    dashboard: {
      displayName: profile.displayName,
      ageBand: profile.ageBand,
      sparkCoins: profile.sparkCoins,
      xp: profile.xp,
      completedMissions: profile.completedMissions,
      missionsCompleted: profile.completedMissions.length
    }
  });
});

module.exports = router;
