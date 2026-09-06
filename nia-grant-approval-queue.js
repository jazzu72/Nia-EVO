const fs=require("fs");

const INPUT="nia-grant-compliance-report.json";
const OUTPUT="nia-grant-approval-queue.json";

function build(){

if(!fs.existsSync(INPUT)){
console.log("❌ Compliance report missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const queue=data.reports
.filter(g=>g.status==="COMPLIANCE_READY")
.map((g,i)=>({

approvalId:"APPROVAL-"+Date.now()+"-"+i,

grant:g.grant,

complianceScore:g.complianceScore,

status:"AWAITING_OWNER_APPROVAL",

approvalSteps:[
"VERIFY_GRANT_REQUIREMENTS",
"REVIEW_APPLICATION_CONTENT",
"CONFIRM_BUDGET",
"AUTHORIZE_SUBMISSION"
],

ownerDecision:"PENDING",

created:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT APPROVAL QUEUE",
mode:"HUMAN_IN_THE_LOOP",
pendingApprovals:queue.length,
queue
},null,2)
);

console.log("✅ GRANT APPROVAL QUEUE ONLINE");
console.log("PENDING:",queue.length);

}

build();

setInterval(build,3600000);
