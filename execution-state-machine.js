const fs = require("fs");

const QUEUE = "execution-queue.json";

const FLOW = {
  EXECUTION_STARTED: "DUE_DILIGENCE",
  DUE_DILIGENCE: "FUNDING_REVIEW",
  FUNDING_REVIEW: "TITLE_REVIEW",
  TITLE_REVIEW: "CLOSING_PREP",
  CLOSING_PREP: "COMPLETED"
};

function advance() {
  if (!fs.existsSync(QUEUE)) return;

  let queue = JSON.parse(fs.readFileSync(QUEUE));

  queue = queue.map(task => {
    const next = FLOW[task.status];

    if (next) {
      console.log(
        "🔄 STATE:",
        task.status,
        "→",
        next,
        task.id
      );

      return {
        ...task,
        status: next,
        updated: new Date().toISOString()
      };
    }

    return task;
  });

  fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2));
}

console.log("🧠 NIA STATE MACHINE ONLINE");

setInterval(advance, 15000);

advance();
