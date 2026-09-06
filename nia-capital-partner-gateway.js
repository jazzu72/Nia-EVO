const fs = require("fs");

const INPUT = "nia-ranked-opportunities.json";
const OUTPUT = "nia-capital-packages.json";

function generatePackages(){

if(!fs.existsSync(INPUT)) return;

const deals = JSON.parse(fs.readFileSync(INPUT));

let packages = [];

deals.forEach(deal=>{

if(deal.rank === "A"){

const pkg = {
id:"CAPITAL-PACKAGE-"+Date.now(),
property:deal.property,
arv:deal.arv,
purchaseOffer:deal.offer,
estimatedSpread:deal.spread,
opportunityScore:deal.opportunityScore,

packageStatus:"READY_FOR_CAPITAL_REVIEW",

requirements:[
"TITLE_REPORT",
"PROPERTY_INSPECTION",
"EXIT_STRATEGY",
"FUNDING_CONFIRMATION"
],

created:new Date().toISOString()
};

packages.push(pkg);

console.log(
"💼 CAPITAL PACKAGE CREATED:",
deal.property
);

}

});

fs.writeFileSync(
OUTPUT,
JSON.stringify(packages,null,2)
);

console.log(
"💰 CAPITAL PACKAGES:",
packages.length
);

}

console.log("💼 NIA CAPITAL PARTNER GATEWAY ONLINE");

generatePackages();

setInterval(generatePackages,60000);
