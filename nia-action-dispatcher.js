const fs = require("fs");

const QUEUE = "execution-queue.json";
const ACTIONS = "nia-actions.json";

function dispatch() {
  if (!fs.existsSync(QUEUE)) return;

  let queue = JSON.parse(fs.readFileSync(QUEUE));

  let actions = [];
  if (fs.existsSync(ACTIONS)) {
    actions = JSON.parse(fs.readFileSync(ACTIONS));
  }

  queue.forEach(task => {
    if (
      task.priorityTier === "A" ||
      task.priorityTier === "B"
    ) {
      const exists = actions.find(a => a.id === task.id);

      if (!exists) {
        const action = {
          id: "ACTION-" + Date.now(),
          dealId: task.id,
          property: task.property,
          action: "CONTACT_SELLER_AND_VERIFY_DEAL",
          priority: task.priorityTier,
          created: new Date().toISOString()
        };

        actions.push(action);

        console.log(
          "🚀 ACTION DISPATCHED:",
          action.id
        );
      }
    }
  });

  fs.writeFileSync(
    ACTIONS,
    JSON.stringify(actions, null, 2)
  );
}

console.log("🚀 NIA ACTION DISPATCHER ONLINE");

dispatch();

setInterval(dispatch, 60000);
