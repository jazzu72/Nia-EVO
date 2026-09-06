const fs = require("fs");

const INPUT = "nia-external-leads.json";
const OUTPUT = "nia-intelligence-feed.json";

function ingest(){

if(!fs.existsSync(INPUT)){
fs.writeFileSync(INPUT, JSON.stringify([],null,2));
}

const leads = JSON.parse(
fs.readFileSync(INPUT)
);

const intelligence = leads.map(lead=>{

const arv = Number(lead.arv || 0);
const offer = Number(lead.offer || 0);

return {
id:"INTEL-"+Date.now(),
property:lead.address,
source:lead.source || "EXTERNAL_FEED",
type:lead.type || "UNKNOWN",
arv,
offer,
spread:arv-offer,
status:"READY_FOR_ANALYSIS",
timestamp:new Date().toISOString()
};

});

fs.writeFileSync(
OUTPUT,
JSON.stringify(intelligence,null,2)
);

console.log(
"🧠 INTELLIGENCE RECORDS:",
intelligence.length
);

}

console.log("🧠 NIA INTELLIGENCE GATEWAY ONLINE");

ingest();

setInterval(ingest,60000);
