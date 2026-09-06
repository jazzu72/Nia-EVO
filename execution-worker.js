const fs = require("fs");

const QUEUE = "execution-queue.json";

function processQueue() {
  if (!fs.existsSync(QUEUE)) return;

  let queue = JSON.parse(fs.readFileSync(QUEUE));

  queue = queue.map(task => {
    if (task.status === "READY_FOR_EXECUTION") {
      console.log("🚀 EXECUTING:", task.id);
      console.log("🏠 PROPERTY:", task.property || "UNKNOWN");

      return {
        ...task,
        status: "EXECUTION_STARTED",
        started: new Date().toISOString()
      };
    }

    return task;
  });

  fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2));
}

console.log("⚙️ NIA EXECUTION WORKER ONLINE");

setInterval(processQueue, 10000);

processQueue();
