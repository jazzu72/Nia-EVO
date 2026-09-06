const routeDeal = require("./nia-execution-router");

function processDiscoveredDeal(deal) {
  console.log("🔎 DEAL RECEIVED FROM DISCOVERY");

  const result = routeDeal({
    address: deal.address,
    arv: Number(deal.arv),
    offer: Number(deal.offer),
    source: deal.source || "nia-discovery"
  });

  console.log("📌 EXECUTION STATUS:", result.status);

  return result;
}

module.exports = processDiscoveredDeal;
