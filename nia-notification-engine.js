const fs = require("fs");

const ACTIONS = "nia-actions.json";
const ALERTS = "nia-alerts.json";

function notify() {
  if (!fs.existsSync(ACTIONS)) return;

  const actions = JSON.parse(fs.readFileSync(ACTIONS));

  let alerts = [];
  if (fs.existsSync(ALERTS)) {
    alerts = JSON.parse(fs.readFileSync(ALERTS));
  }

  actions.forEach(action => {
    const exists = alerts.find(
      a => a.actionId === action.id
    );

    if (!exists) {
      const alert = {
        id: "ALERT-" + Date.now(),
        actionId: action.id,
        message:
          "NIA ACTION READY: " +
          action.action +
          " | " +
          action.property,
        priority: action.priority,
        timestamp: new Date().toISOString()
      };

      alerts.push(alert);

      console.log(
        "🔔 NIA ALERT CREATED:",
        alert.message
      );
    }
  });

  fs.writeFileSync(
    ALERTS,
    JSON.stringify(alerts, null, 2)
  );
}

console.log("🔔 NIA NOTIFICATION ENGINE ONLINE");

notify();

setInterval(notify, 60000);
