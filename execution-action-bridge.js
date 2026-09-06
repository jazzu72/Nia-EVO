const routeDeal = require("./nia-execution-router");
const { addExecutionTask } = require("./execution-queue");

function createExecutionTask(deal) {
  const result = routeDeal(deal);

  const task = {
    id: "EXEC-" + Date.now(),
    status: result.status,
    confidence: result.confidence,
    action: "BEGIN_DEAL_EXECUTION",
    property: deal.address,
    arv: deal.arv,
    offer: deal.offer,
    source: deal.source || "NIA",
    created: new Date().toISOString()
  };

  console.log("⚡ NIA ACTION CREATED");
  console.log(JSON.stringify(task, null, 2));

  addExecutionTask(task);

  return task;
}

module.exports = createExecutionTask;

if (require.main === module) {
  createExecutionTask({
    address: "4110 Reisterstown Rd, Baltimore MD",
    arv: 155000,
    offer: 93000,
    source: "NIA-DISCOVERY"
  });
}
