const executeDeal = require("./execution-bridge");

function routeDeal(deal) {
  if (!deal || !deal.address) {
    return {
      status: "REJECTED",
      reason: "Missing property data"
    };
  }

  const result = executeDeal(deal);

  console.log("🚀 NIA ROUTER:", result.status);

  return result;
}

module.exports = routeDeal;

// test boot
if (require.main === module) {
  routeDeal({
    address: "4110 Reisterstown Rd, Baltimore MD",
    arv: 155000,
    offer: 93000,
    source: "deal-discovery"
  });
}
