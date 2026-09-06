const fs = require("fs");

const INPUT = "nia-capital-packages.json";
const OUTPUT = "nia-investor-packages.json";

function generate(){

if(!fs.existsSync(INPUT)) return;

const packages = JSON.parse(fs.readFileSync(INPUT));

let investorPackages = [];

packages.forEach(pkg=>{

const investorPackage = {

id:"INVESTOR-PACKAGE-"+Date.now(),

property:pkg.property,

summary:{
purchasePrice:pkg.purchaseOffer,
afterRepairValue:pkg.arv,
projectedSpread:pkg.estimatedSpread,
returnProfile:
pkg.estimatedSpread && pkg.purchaseOffer ?
((pkg.estimatedSpread/pkg.purchaseOffer)*100).toFixed(2)+"%"
:"N/A"
},

investmentThesis:[
"DISTRESSED ASSET ACQUISITION",
"BELOW MARKET ENTRY",
"VALUE CREATION OPPORTUNITY",
"EXIT STRATEGY REQUIRED"
],

dueDiligence:[
"TITLE_SEARCH",
"INSPECTION",
"COMPARABLE_ANALYSIS",
"FUNDING_VERIFICATION"
],

status:"READY_FOR_INVESTOR_REVIEW",

created:new Date().toISOString()

};

investorPackages.push(investorPackage);

console.log(
"📄 INVESTOR PACKAGE CREATED:",
pkg.property
);

});

fs.writeFileSync(
OUTPUT,
JSON.stringify(investorPackages,null,2)
);

console.log(
"📄 TOTAL INVESTOR PACKAGES:",
investorPackages.length
);

}

console.log("📄 NIA INVESTOR PACKAGE GENERATOR ONLINE");

generate();

setInterval(generate,60000);
