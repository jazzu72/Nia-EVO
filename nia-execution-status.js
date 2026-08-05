const checkExecutionHealth = require("./execution-monitor");

const status = checkExecutionHealth();

const report = {
  module: "NIA-CORE",
  subsystem: "EXECUTION",
  online: status.status === "ONLINE",
  confidence: status.confidence || "0%",
  heartbeat: status.heartbeat || null,
  timestamp: new Date().toISOString()
};

console.log("🧠 NIA CORE EXECUTION REPORT");
console.log(JSON.stringify(report, null, 2));

module.exports = report;
