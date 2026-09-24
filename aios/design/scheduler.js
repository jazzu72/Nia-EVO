/*
  NIA SCHEDULER — daily autonomous tasks
  Runs inside the server process. No external cron needed.
*/

const cron = require("node-cron");
const autoDrafter = require("./auto-drafter");
const weeklyBrief = require("./weekly-brief");
const ceoLoop = require("./ceo-loop");

let started = false;

function start() {
  if (started) return;
  started = true;

  // Auto-draft every day at 6:00 AM
  cron.schedule("0 6 * * *", async function () {
    console.log("[scheduler] auto-draft starting");
    try {
      const result = await autoDrafter.runAutoDraft({ daily_cap: 5, min_confidence: 0.6 });
      console.log("[scheduler] auto-draft complete:", JSON.stringify(result));
    } catch (e) {
      console.error("[scheduler] auto-draft failed:", e.message);
    }
  });

  // CEO daily loop — 6 AM
  cron.schedule("0 6 * * *", async function () {
    console.log("[scheduler] CEO daily loop starting");
    try {
      const result = await ceoLoop.runFullDay();
      console.log("[scheduler] CEO day complete:", JSON.stringify(result));
    } catch (e) {
      console.error("[scheduler] CEO loop failed:", e.message);
    }
  });

  // Weekly brief every Monday 8:00 AM
  cron.schedule("0 8 * * 1", async function () {
    console.log("[scheduler] weekly brief starting");
    try {
      const result = await weeklyBrief.generateBrief();
      console.log("[scheduler] weekly brief complete:", result.generator);
    } catch (e) {
      console.error("[scheduler] weekly brief failed:", e.message);
    }
  });

  console.log("[scheduler] started — auto-draft 6am daily, brief Monday 8am");
}

module.exports = { start };
