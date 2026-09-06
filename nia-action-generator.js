const fs = require("fs");

const INPUT = "nia-ranked-opportunities.json";
const OUTPUT = "nia-actions.json";

function generate(){

if(!fs.existsSync(INPUT)) return;

const deals = JSON.parse(fs.readFileSync(INPUT));

let actions = [];

deals.forEach(deal=>{

if(deal.rank === "A"){

actions.push({
id:"ACTION-"+Date.now(),
property:deal.property,
action:"CONTACT_SELLER_AND_VERIFY_DEAL",
priority:"HIGH",
opportunityScore:deal.opportunityScore,
spread:deal.spread,
created:new Date().toISOString()
});

actions.push({
id:"ACTION-"+Date.now(),
property:deal.property,
action:"REQUEST_TITLE_REVIEW",
priority:"HIGH",
created:new Date().toISOString()
});

actions.push({
id:"ACTION-"+Date.now(),
property:deal.property,
action:"PREPARE_CAPITAL_PACKAGE",
priority:"HIGH",
created:new Date().toISOString()
});

console.log(
"⚡ ACTIONS GENERATED:",
deal.property
);

}

});

fs.writeFileSync(
OUTPUT,
JSON.stringify(actions,null,2)
);

console.log(
"⚡ TOTAL ACTIONS:",
actions.length
);

}

console.log("⚡ NIA ACTION GENERATOR ONLINE");

generate();

setInterval(generate,60000);
