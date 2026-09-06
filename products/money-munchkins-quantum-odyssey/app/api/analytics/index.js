const express = require("express");
const cohorts = require("../../../platform/analytics/cohort-engine");

const router = express.Router();

router.get("/cohorts", (req, res) => {
  res.json({
    success: true,
    product: "money-munchkins-quantum-odyssey",
    analytics: cohorts.metrics()
  });
});

module.exports = router;
