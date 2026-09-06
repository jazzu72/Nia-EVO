const autonomyFusion = require("../core/autonomy-fusion");
const telemetry = require("./telemetry");
const errorHandler = require("./error-handler");

let lastCycle = 0;

async function runAutonomy() {
  try {
    const context = {
      auto: true,
      timestamp: Date.now()
    };

    const result = await autonomyFusion(context);
    lastCycle = Date.now();

    telemetry("autonomy_cycle", {
      directive: result.decision?.decision,
      correction: result.correction,
      fusion: result.fusion
    });

  } catch (err) {
    errorHandler(err, { component: "autonomy_scheduler" });
  }
}

module.exports = function startScheduler() {
  setInterval(runAutonomy, 5000); // 5‑second sovereign heartbeat
};
