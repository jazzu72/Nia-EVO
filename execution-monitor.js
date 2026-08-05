const fs = require("fs");

function checkExecutionHealth() {
  if (!fs.existsSync("execution-health.json")) {
    return {
      status: "UNKNOWN",
      reason: "No health signal"
    };
  }

  const health = JSON.parse(
    fs.readFileSync("execution-health.json", "utf8")
  );

  console.log("🏰 NIA EXECUTION MONITOR");
  console.log("STATUS:", health.status);
  console.log("CONFIDENCE:", health.confidence);
  console.log("LAST HEARTBEAT:", health.heartbeat);

  return health;
}

module.exports = checkExecutionHealth;

if (require.main === module) {
  checkExecutionHealth();
}
