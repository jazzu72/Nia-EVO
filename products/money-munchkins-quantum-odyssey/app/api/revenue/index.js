const express = require("express");
const revenue = require("../../../platform/revenue/pilot-revenue");

const router = express.Router();

router.post("/pilot-payment", (req, res) => {
  try {
    const tx = revenue.record(req.body || {});

    res.status(201).json({
      success: true,
      transaction: tx
    });
  } catch {
    res.status(400).json({
      success: false,
      error: "INVALID_REVENUE_EVENT"
    });
  }
});

router.get("/metrics", (req, res) => {
  res.json({
    success: true,
    revenue: revenue.metrics()
  });
});

module.exports = router;
