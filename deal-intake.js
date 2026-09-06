const createExecutionTask = require("./execution-action-bridge");

function intakeDeal(deal) {
  console.log("🔎 DEAL INTAKE RECEIVED");

  return createExecutionTask({
    address: deal.address,
    arv: deal.arv,
    offer: deal.offer,
    source: "NIA-AUTONOMOUS-DISCOVERY"
  });
}

module.exports = intakeDeal;

if (require.main === module) {
  intakeDeal({
    address: "4110 Reisterstown Rd, Baltimore MD",
    arv: 155000,
    offer: 93000
  });
}
