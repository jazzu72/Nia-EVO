const fs = require("fs");

const QUEUE = "execution-queue.json";

function routeFunding() {
  if (!fs.existsSync(QUEUE)) return;

  let queue = JSON.parse(fs.readFileSync(QUEUE));

  queue = queue.map(task => {
    if (task.capitalDecision === "FUNDING_READY") {
      console.log(
        "🏦 FUNDING ROUTED:",
        task.id
      );

      return {
        ...task,
        status: "FUNDING_REVIEW",
        fundingStatus: "READY_FOR_CAPITAL_PARTNER",
        fundingTimestamp: new Date().toISOString()
      };
    }

    return task;
  });

  fs.writeFileSync(
    QUEUE,
    JSON.stringify(queue, null, 2)
  );
}

console.log("🏦 NIA FUNDING ROUTER ONLINE");

routeFunding();

setInterval(routeFunding, 60000);
