const engine = require("./execution-api");

console.log(JSON.stringify({
  system: "NIA-CAPITAL-OS",
  module: "EXECUTION_ENGINE",
  status: "ONLINE",
  confidence: (engine.calculatePathSuccessProbability()*100).toFixed(2) + "%",
  timestamp: new Date().toISOString()
}, null, 2));
