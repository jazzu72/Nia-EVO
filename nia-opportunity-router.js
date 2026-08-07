const fs=require("fs");

const INPUT="nia-live-opportunity-queue.json";
const OUTPUT="nia-funding-opportunity-router.json";

function route(){

if(!fs.existsSync(INPUT)){
console.log("❌ Opportunity queue missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const routed=data.opportunities.map((o,i)=>({

id:"OPPORTUNITY-"+Date.now()+"-"+i,

source:o.source,

category:o.category,

fitScore:o.fitScore,

priority:
o.fitScore>=90 ? "HIGH" :
o.fitScore>=80 ? "MEDIUM" :
"LOW",

pipelineStage:"QUALIFIED",

nextActions:[
"SCORE_MISSION_ALIGNMENT",
"BUILD_APPLICATION_PACKAGE",
"OWNER_REVIEW",
"SUBMISSION_QUEUE"
],

assigned:"NIA-CAPITAL-OS",

created:new Date().toISOString()

}))
.sort((a,b)=>b.fitScore-a.fitScore);

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA FUNDING OPPORTUNITY ROUTER",
mode:"AUTONOMOUS_PIPELINE",
total:routed.length,
topOpportunity:routed[0],
opportunities:routed
},null,2)
);

console.log("🚦 FUNDING OPPORTUNITY ROUTER ONLINE");
console.log("TOP:",routed[0].source);
console.log("SCORE:",routed[0].fitScore);

}

route();

setInterval(route,3600000);
