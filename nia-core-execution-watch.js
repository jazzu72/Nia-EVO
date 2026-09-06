const checkExecutionHealth = require("./execution-monitor");

console.log("🧠 NIA CORE EXECUTION WATCH ONLINE");

setInterval(() => {
  const status = checkExecutionHealth();

  if (status.status === "ONLINE") {
    console.log(
      "✅ EXECUTION READY | CONFIDENCE:",
      status.confidence
    );
  } else {
    console.log("⚠️ EXECUTION WARNING:", status);
  }
}, 30000);
