const fs=require("fs");

const INPUT="nia-grant-readiness-report.json";
const OUTPUT="nia-grant-response-intelligence.json";

function analyze(){

if(!fs.existsSync(INPUT)){
console.log("❌ Grant readiness report missing");
return;
}

const report=JSON.parse(fs.readFileSync(INPUT));

const intelligence=report.reports.map((g)=>({

grant:g.grant,

status:g.status,

responsePrediction:
g.status==="UNDER_REVIEW" ? "AWAITING_AGENCY_DECISION" : "ACTION_REQUIRED",

confidenceScore:
g.grant.includes("NSF") ? 95 :
g.grant.includes("SBA") ? 90 :
85,

nextActions:[
"MONITOR_RESPONSE",
"PREPARE_FOLLOW_UP",
"UPDATE_DOCUMENTS_IF_REQUESTED",
"OWNER_NOTIFICATION"
],

ownerAlert:true,

checked:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT RESPONSE INTELLIGENCE",
mode:"FUNDING_FIRST",
tracked:intelligence.length,
intelligence
},null,2)
);

console.log("🧠 GRANT RESPONSE INTELLIGENCE ONLINE");
console.log("TRACKED:",intelligence.length);

}

analyze();

setInterval(analyze,86400000);
