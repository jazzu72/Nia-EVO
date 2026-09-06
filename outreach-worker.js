const cron = require("node-cron");
const outreach = require("./outreach-engine");

console.log("📨 Nia Outreach Worker online");

outreach.run();

cron.schedule("0 */6 * * *",()=>{
  console.log("🔄 Running scheduled outreach...");
  outreach.run();
});
