const fs=require("fs");

const INPUT="nia-grant-feed-monitor.json";
const OUTPUT="nia-grant-intelligence-queue.json";

function intelligence(){

if(!fs.existsSync(INPUT)){
console.log("❌ Grant feed missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const queue=data.feeds.map((g,i)=>({

id:"GRANT-INTEL-"+Date.now()+"-"+i,

source:g.source,

mission:"GRANTS",

priority:g.priority,

score:
g.source.includes("NSF") ? 95 :
g.source.includes("SBA") ? 92 :
g.source.includes("Virginia") ? 88 : 90,

recommendedActions:[

"VERIFY_CURRENT_OPENINGS",

"CHECK_ELIGIBILITY_RULES",

"MATCH_NIA_CAPITAL_OS_PROFILE",

"GENERATE_FINAL_APPLICATION",

"QUEUE_FOR_APPROVAL"

],

executionStatus:"READY",

ownerApprovalRequired:true,

created:new Date().toISOString()

}))
.sort((a,b)=>b.score-a.score);

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT INTELLIGENCE ENGINE",
mode:"FUNDING_FIRST",
topTarget:queue[0],
queue
},null,2)
);

console.log("🧠 GRANT INTELLIGENCE ENGINE ONLINE");
console.log("TOP TARGET:",queue[0].source);
console.log("SCORE:",queue[0].score);

}

intelligence();

setInterval(intelligence,900000);
