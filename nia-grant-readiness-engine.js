const fs=require("fs");

const INPUT="nia-priority-execution-queue.json";
const OUTPUT="nia-grant-readiness-report.json";

function check(){

if(!fs.existsSync(INPUT)){

console.log("⚠️ Priority queue missing - rebuilding from execution queue");

if(fs.existsSync("nia-execution-queue.json")){

const source=JSON.parse(
fs.readFileSync("nia-execution-queue.json")
);

fs.writeFileSync(
INPUT,
JSON.stringify({
system:"NIA FUNDING PRIORITY QUEUE",
mode:"GRANTS_FIRST",
queue:source.tasks || []
},null,2)
);

console.log("✅ Priority queue rebuilt");

}else{

console.log("❌ No execution queue available");
return;

}

}

const data=JSON.parse(fs.readFileSync(INPUT));

const reports=(data.queue||[]).filter(
g=>g.type==="GRANTS"
).map(g=>({

grant:g.source,

status:"UNDER_REVIEW",

eligibility:{
companyProfile:"READY",
technologyFit:"READY",
commercializationPlan:"READY",
registration:"VERIFY"
},

documents:{
innovationSummary:"READY",
businessPlan:"READY",
budget:fs.existsSync("data/budget.json") ? "READY" : "PENDING",
financials:fs.existsSync("data/financials.json") ? "READY" : "PENDING"
},

nextActions:[
"VERIFY_ELIGIBILITY",
"PREPARE_BUDGET",
"ATTACH_DOCUMENTS",
"OWNER_APPROVAL"
],

approvalRequired:true,

created:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT READINESS ENGINE",
mode:"FUNDING_FIRST",
readyForSubmission:false,
grantCount:reports.length,
reports
},null,2)
);

console.log("📑 GRANT READINESS ENGINE ONLINE");
console.log("GRANTS REVIEWED:",reports.length);

}

check();

setInterval(check,300000);
