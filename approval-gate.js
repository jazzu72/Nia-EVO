const fs = require("fs");

const QUEUE = "execution-queue.json";

function approve() {
  if (!fs.existsSync(QUEUE)) return;

  let queue = JSON.parse(fs.readFileSync(QUEUE));

  queue = queue.map(task => {
    if (task.dealScore >= 70 && task.decision === "APPROVED") {
      console.log(
        "🟢 APPROVED FOR EXECUTION:",
        task.id
      );

      return {
        ...task,
        approved: true,
        status: "EXECUTION_STARTED",
        approvedAt: new Date().toISOString()
      };
    }

    return task;
  });

  fs.writeFileSync(
    QUEUE,
    JSON.stringify(queue, null, 2)
  );
}

console.log("🛡️ NIA APPROVAL GATE ONLINE");

approve();

setInterval(approve, 60000);
