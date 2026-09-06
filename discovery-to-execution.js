const intakeDeal = require("./deal-intake");

function processDiscovery(leads) {
  console.log("🔎 NIA DISCOVERY → EXECUTION PIPELINE ONLINE");

  leads.forEach((deal, index) => {
    console.log("📌 PROCESSING LEAD", index + 1);

    intakeDeal(deal);
  });
}

module.exports = processDiscovery;

if (require.main === module) {
  processDiscovery([
    {
      address: "4110 Reisterstown Rd, Baltimore MD",
      arv: 155000,
      offer: 93000,
      source: "FORECLOSURE-SCAN"
    }
  ]);
}
