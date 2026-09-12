const express = require("express");
const router = express.Router();
const engine = require("../capital/parallel-capital-engine");

router.get("/health", (req,res) => res.json({
  ok:true,
  engine:"NIA_PARALLEL_CAPITAL_ENGINE",
  status:"ONLINE",
  lanes:engine.lanes.length,
  autonomous_execution:false,
  external_execution_allowed:false,
  human_approval_required:true
}));

router.get("/hunt", async (req,res) => {
  try {
    const sources = await engine.getLiveCapitalSources();
    const result = await engine.discover(sources);
    console.log("[CAPITAL API] LIVE SOURCES:", Object.keys(sources), "OPPORTUNITIES:", result.opportunities.length);
    res.json(result);
  } catch (error) {
    console.error("[CAPITAL HUNT]", error);
    res.status(500).json({ok:false,error:error.message});
  }
});

router.get("/summary", async (req,res) => {
  try {
    const result = await engine.discover(await engine.getLiveCapitalSources());
    res.json({ok:true,...result.summary,timestamp:result.timestamp});
  } catch (error) {
    res.status(500).json({ok:false,error:error.message});
  }
});

module.exports = router;
