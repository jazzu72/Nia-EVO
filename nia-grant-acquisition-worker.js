const fs=require("fs");

const INPUT="nia-grant-intelligence-queue.json";
const OUTPUT="nia-grant-execution-board.json";

function worker(){

if(!fs.existsSync(INPUT)){
console.log("❌ Grant intelligence missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const tasks=data.queue.map((g,i)=>({

taskId:"GRANT-TASK-"+Date.now()+"-"+i,

source:g.source,

mission:"GRANTS",

priority:g.score,

status:"READY_FOR_EXECUTION",

workflow:[
"VERIFY_OPEN_GRANT",
"CHECK_COMPANY_ELIGIBILITY",
"PREPARE_APPLICATION_DOCUMENTS",
"GENERATE_BUDGET",
"OWNER_APPROVAL",
"SUBMISSION_READY"
],

assigned:"NIA-CAPITAL-OS",

approvalRequired:g.ownerApprovalRequired,

created:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT ACQUISITION WORKER",
mode:"FUNDING_FIRST",
activeTasks:tasks.length,
tasks
},null,2)
);

console.log("⚙️ GRANT ACQUISITION WORKER ONLINE");
console.log("ACTIVE TASKS:",tasks.length);

}

worker();

setInterval(worker,900000);
