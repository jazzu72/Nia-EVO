const fs = require("fs");

const QUEUE = "execution-queue.json";

function verifyClosing() {
  if (!fs.existsSync(QUEUE)) return;

  let queue = JSON.parse(fs.readFileSync(QUEUE));

  queue = queue.map(task => {
    if (task.status === "CLOSING_PREP") {
      const checklist = task.closingChecklist || [];

      if (checklist.length === 4) {
        console.log(
          "✅ CLOSING VERIFIED:",
          task.id
        );

        return {
          ...task,
          status: "COMPLETED",
          closingStatus: "SUCCESS",
          completedAt: new Date().toISOString()
        };
      }
    }

    return task;
  });

  fs.writeFileSync(
    QUEUE,
    JSON.stringify(queue, null, 2)
  );
}

console.log("✅ NIA CLOSING VERIFICATION ENGINE ONLINE");

verifyClosing();

setInterval(verifyClosing, 60000);
