const fs = require("fs");

const INPUT = "nia-funding-submissions.json";
const OUTPUT = "nia-capital-outreach-queue.json";

function buildOutreach(){

if(!fs.existsSync(INPUT)) return;

const submissions = JSON.parse(fs.readFileSync(INPUT));

let queue = [];

submissions.forEach(deal=>{

const outreach = {
id:"OUTREACH-"+Date.now(),

property:deal.property,

targetTypes:[
"PRIVATE_INVESTOR",
"REAL_ESTATE_FUND",
"HARD_MONEY_LENDER",
"CAPITAL_PARTNER"
],

messageStatus:"READY",

dealSummary:{
purchase:deal.capitalRequest.purchaseOffer,
arv:deal.capitalRequest.arv,
spread:deal.capitalRequest.estimatedSpread
},

priority:
deal.investorScore >= 90 ?
"URGENT" :
"HIGH",

nextAction:
"CONTACT_CAPITAL_PARTNER",

created:new Date().toISOString()
};

queue.push(outreach);

console.log(
"📡 OUTREACH CREATED:",
deal.property
);

});

fs.writeFileSync(
OUTPUT,
JSON.stringify(queue,null,2)
);

console.log(
"📡 CAPITAL OUTREACH QUEUE:",
queue.length
);

}

console.log("📡 NIA CAPITAL OUTREACH ENGINE ONLINE");

buildOutreach();

setInterval(buildOutreach,60000);
