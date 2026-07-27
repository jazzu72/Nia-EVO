// NIA Daily CEO Loop

const fs = require("fs");

function loadModule(path) {
  try {
    return require(path);
  } catch (err) {
    console.log(`⚠️ Skipping ${path}: ${err.message}`);
    return null;
  }
}

const briefing = loadModule("../reports/revenue-briefing-engine");
const operator = loadModule("../revenue/operator/daily-operator");
const hunter = loadModule("../hunter/realestate/realestate-hunter");
const brain = loadModule("../intelligence/revenue-brain");
const revenue = loadModule("../revenue/revenue-engine");

async function run() {
  console.log("🏰 NIA CEO DAILY LOOP");
  console.log("====================");

  if (hunter && hunter.list) {
    const leads = hunter.list();
    console.log(`🏢 Brokerages: ${leads.length}`);
  }

  if (revenue && revenue.dashboard) {
    const dash = revenue.dashboard();
    console.log(`💰 Pipeline: $${dash.pipelineValue}`);
    console.log(`📈 Deals: ${dash.totalDeals}`);
  }

  if (brain && brain.analyzePipeline && revenue && revenue.pipeline) {
    const analysis = brain.analyzePipeline(revenue.pipeline());
    console.log("🧠 Pipeline Analysis");
    console.log(JSON.stringify(analysis, null, 2));
  }

  if (operator && operator.generate) {
    console.log("📋 Daily Operator");
    console.log(operator.generate());
  }

  if (briefing && briefing.generate) {
    const report = briefing.generate();

    fs.mkdirSync("data/reports", { recursive: true });

    fs.writeFileSync(
      "data/reports/latest-ceo-report.json",
      JSON.stringify(report, null, 2)
    );

    console.log("✅ CEO report saved.");
  }

  console.log("🏁 Daily CEO Loop Complete");
}

run().catch(console.error);
