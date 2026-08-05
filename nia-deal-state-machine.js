const fs = require("fs");

const INPUT = "nia-ranked-opportunities.json";
const OUTPUT = "nia-deal-pipeline.json";

const STATES = [
"DISCOVERED",
"VERIFIED",
"RANKED",
"CAPITAL_READY",
"INVESTOR_REVIEW",
"EXECUTION",
"CLOSED"
];

function process(){

if(!fs.existsSync(INPUT)) return;

const deals = JSON.parse(fs.readFileSync(INPUT));

const pipeline = deals.map(deal=>{

let state="DISCOVERED";

if(deal.discoveryStatus==="VERIFIED")
state="VERIFIED";

if(deal.opportunityScore>=80)
state="RANKED";

if(deal.rank==="A")
state="CAPITAL_READY";

return {
property:deal.property,
score:deal.opportunityScore,
state,
next:
STATES[STATES.indexOf(state)+1] || "CLOSED",
updated:new Date().toISOString()
};

});

fs.writeFileSync(
OUTPUT,
JSON.stringify(pipeline,null,2)
);

console.log(
"🧠 NIA PIPELINE UPDATED:",
pipeline.length
);

}

console.log(
"🧠 NIA DEAL STATE MACHINE ONLINE"
);

process();

setInterval(process,60000);
