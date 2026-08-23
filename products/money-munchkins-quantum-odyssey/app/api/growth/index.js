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

router.get("/metrics", (req, res) => {
  res.json({
    success: true,
    product: "money-munchkins-quantum-odyssey",
    funnel: funnel.metrics()
  });
});

module.exports = router;
