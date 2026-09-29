const express = require("express");
const router = express.Router();

const discovery = require("./lead-acquisition-engine");
const acquisition = require("../revenue/acquisition/acquisition-engine");

router.get("/status", (req, res) => {
  const prospects = acquisition.topProspects(10000);

  res.json({
    ok: true,
    system: "Nia Lead Acquisition",
    status: "ONLINE",
    persistedLeads: prospects.length,
    timestamp: new Date().toISOString()
  });
});

router.get("/stats", (req, res) => {
  const prospects = acquisition.topProspects(10000);

  const counts = { HOT: 0, WARM: 0, COLD: 0 };

  for (const p of prospects) {
    const priority =
      p.priority ||
      acquisition.classifyScore(p.score);

    if (counts[priority] !== undefined) counts[priority]++;
  }

  const totalValue = prospects.reduce(
    (sum, p) => sum + (Number(p.estimatedValue) || 0),
    0
  );

  res.json({
    ok: true,
    total: prospects.length,
    hot: counts.HOT,
    warm: counts.WARM,
    cold: counts.COLD,
    estimatedPipeline: totalValue,
    timestamp: new Date().toISOString()
  });
});

router.get("/leads", (req, res) => {
  const limit = Math.min(
    Math.max(Number(req.query.limit) || 50, 1),
    500
  );

  res.json({
    ok: true,
    total: acquisition.topProspects(10000).length,
    leads: acquisition.topProspects(limit),
    timestamp: new Date().toISOString()
  });
});

router.get("/top", (req, res) => {
  const limit = Math.min(
    Math.max(Number(req.query.limit) || 10, 1),
    100
  );

  res.json({
    ok: true,
    leads: acquisition.topProspects(limit),
    timestamp: new Date().toISOString()
  });
});

router.post("/run", (req, res) => {
  try {
    const result = discovery.acquire();

    res.json({
      ok: true,
      ...result
    });
  } catch (error) {
    console.error("ACQUISITION_RUN_ERROR", error);

    res.status(500).json({
      ok: false,
      error: "Acquisition run failed"
    });
  }
});

module.exports = router;
