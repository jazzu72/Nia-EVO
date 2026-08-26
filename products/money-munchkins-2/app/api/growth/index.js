const express = require("express");
const funnel = require("../../../platform/growth/funnel-engine");

const router = express.Router();

router.post("/track", (req, res) => {
  try {
    const { id, stage } = req.body || {};
    res.status(201).json({
      success: true,
      funnel: funnel.track(id, stage)
    });
  } catch {
    res.status(400).json({
      success: false,
      error: "INVALID_FUNNEL_EVENT"
    });
  }
});


router.post("/pilot-signup", (req, res) => {
  const { name, email, consent } = req.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (
    !name ||
    name.trim().length < 2 ||
    !normalizedEmail.includes("@") ||
    consent !== true
  ) {
    return res.status(400).json({
      success: false,
      error: "INVALID_PILOT_SIGNUP"
    });
  }

  try {
    const existing = funnel.metrics();
    const alreadyTracked = existing.funnel &&
      Object.prototype.hasOwnProperty.call(existing.funnel, normalizedEmail);

    if (!alreadyTracked) {
      funnel.track(normalizedEmail, "interest");
      funnel.track(normalizedEmail, "signup");
    }

    res.status(alreadyTracked ? 200 : 201).json({
      success: true,
      message: alreadyTracked
        ? "PILOT_SIGNUP_ALREADY_RECORDED"
        : "PILOT_SIGNUP_RECORDED"
    });
  } catch {
    res.status(400).json({
      success: false,
      error: "PILOT_SIGNUP_FAILED"
    });
  }
});


router.post("/pilot-intake", (req, res) => {
  const { parentGuardian, email, consent } = req.body || {};

  if (!parentGuardian || !email || !email.includes("@") || consent !== true) {
    return res.status(400).json({
      success: false,
      error: "PARENT_GUARDIAN_CONSENT_REQUIRED"
    });
  }

  try {
    funnel.track(email.toLowerCase(), "signup");
    funnel.track(email.toLowerCase(), "pilotCohort");

    return res.status(201).json({
      success: true,
      message: "PILOT_INTAKE_RECORDED",
      autoSend: false
    });
  } catch {
    return res.status(400).json({
      success: false,
      error: "PILOT_INTAKE_FAILED"
    });
  }
});

router.get("/metrics", (req, res) => {
  res.json({
    success: true,
    product: "money-munchkins-quantum-odyssey",
    funnel: funnel.metrics()
  });
});

module.exports = router;
