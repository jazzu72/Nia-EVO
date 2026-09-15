const express = require("express");
const router = express.Router();
const plan = require("../design/revenue-plan");

router.get("/", async function (req, res) {
  try {
    const result = await plan.buildPlan();
    res.json(result);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
