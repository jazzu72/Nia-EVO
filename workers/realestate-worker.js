// NIA Real Estate Worker

const hunter = require("../hunter/realestate/realestate-hunter");

const brokerages = [
  {
    company: "ABC Realty",
    contact: "Broker",
    city: "Norfolk",
    agents: 25,
    value: 5000
  },
  {
    company: "Harbor Homes Realty",
    contact: "Owner",
    city: "Virginia Beach",
    agents: 18,
    value: 5000
  },
  {
    company: "Coastal Property Group",
    contact: "Managing Broker",
    city: "Chesapeake",
    agents: 30,
    value: 5000
  }
];

console.log("🏡 NIA Real Estate Worker");

for (const brokerage of brokerages) {
  try {
    const result = hunter.addBrokerage(brokerage);
    console.log(`✅ Added ${brokerage.company}`);
    console.log(result.opportunity);
  } catch (err) {
    console.log(`⚠️ Skipped ${brokerage.company}: ${err.message}`);
  }
}
