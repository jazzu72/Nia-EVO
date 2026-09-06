const fs = require("fs");

const QUEUE = "execution-queue.json";

function approve() {
  if (!fs.existsSync(QUEUE)) return;

  let queue = JSON.parse(fs.readFileSync(QUEUE));

  queue = queue.map(task => {
    if (task.dealScore >= 70 && task.decision === "APPROVED") {
      console.log(
        "🟡 APPROVAL REQUIRED — legacy gate quarantined:",
        task.id
      );

      return {
        ...task,
        approved: false,
        status: "APPROVAL_REQUIRED",
        execution_authorized: false,
        execution_performed: false,
        autonomous_execution: false,
        human_approval_required: true
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
