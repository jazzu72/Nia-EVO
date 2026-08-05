const engine = require("./execution-api");

function executeDeal(deal) {
  const confidence =
    (engine.calculatePathSuccessProbability() * 100).toFixed(2) + "%";

  console.log("🏰 NIA DEAL EXECUTION BRIDGE");
  console.log("PROPERTY:", deal.address || "UNKNOWN");
  console.log("ARV:", deal.arv || 0);
  console.log("OFFER:", deal.offer || 0);
  console.log("EXECUTION CONFIDENCE:", confidence);

  return {
    status: "READY_FOR_EXECUTION",
    confidence,
    deal
  };
}

module.exports = executeDeal;
