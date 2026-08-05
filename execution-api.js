const FlawlessExecution = require("./execution-flawless");

const engine = new FlawlessExecution();

console.log("🏰 NIA EXECUTION API ONLINE");
console.log(
  "📊 EXECUTION CONFIDENCE:",
  (engine.calculatePathSuccessProbability() * 100).toFixed(2) + "%"
);

// Execution endpoint bridge
global.NIA_EXECUTION_ENGINE = engine;

// heartbeat
const fs = require("fs");

setInterval(() => {
  fs.writeFileSync(
    "execution-health.json",
    JSON.stringify({
      status: "ONLINE",
      confidence: (engine.calculatePathSuccessProbability() * 100).toFixed(2) + "%",
      heartbeat: new Date().toISOString()
    }, null, 2)
  );
}, 60000);

module.exports = engine;
