const apiBrain = require("./api-brain");
const tasks = require("./tasks");
const memory = require("./memory");
const planner = require("./planner");

// --- NIA heartbeat ---
async function nia_cycle() {
  try {
    const thought = await apiBrain("State your current status.");
    console.log("[NIA]", thought || "No response");
  } catch (e) {
    console.log("[NIA ERROR]", e.message);
  }
}
setInterval(nia_cycle, 15000);

// --- Autonomous tasks ---
tasks.register("plan_step_execution", 35000, async () => {
  const plan = planner.get();
  if (!plan) return "NO_PLAN";
  return await planner.executeNext();
});

// Run tasks every second
setInterval(() => tasks.tick(), 1000);

// Start API server last
require("../api/server.js");
