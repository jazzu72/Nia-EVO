const fs = require("fs");

const QUEUE = "execution-queue.json";
const AUDIT = "execution-audit.json";

function audit() {
  if (!fs.existsSync(QUEUE)) return;

  const queue = JSON.parse(fs.readFileSync(QUEUE));

  let history = [];
  if (fs.existsSync(AUDIT)) {
    history = JSON.parse(fs.readFileSync(AUDIT));
  }

  queue.forEach(task => {
    const exists = history.find(
      h => h.id === task.id && h.status === task.status
    );

    if (!exists) {
      history.push({
        id: task.id,
        property: task.property || "UNKNOWN",
        status: task.status,
        confidence: task.confidence || null,
        timestamp: new Date().toISOString()
      });

      console.log("📜 AUDIT RECORDED:", task.id, task.status);
    }
  });

  fs.writeFileSync(
    AUDIT,
    JSON.stringify(history, null, 2)
  );
}

console.log("📜 NIA EXECUTION AUDIT ONLINE");

setInterval(audit, 10000);

audit();
