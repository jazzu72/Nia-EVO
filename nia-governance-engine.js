const fs=require("fs");
const crypto=require("crypto");

const INPUT="nia-action-execution.json";
const OUTPUT="nia-audit-ledger.json";

function audit(){

if(!fs.existsSync(INPUT)) return;

const tasks=JSON.parse(fs.readFileSync(INPUT));

const ledger=tasks.map(task=>({

auditId:
"AUDIT-"+crypto.randomBytes(6).toString("hex"),

executionId:task.executionId,

property:task.property,

action:task.task,

status:task.status,

approvalRequired:true,

verified:false,

hash:
crypto
.createHash("sha256")
.update(JSON.stringify(task))
.digest("hex"),

timestamp:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify(ledger,null,2)
);

console.log(
"🛡️ NIA GOVERNANCE AUDIT CREATED:",
ledger.length
);

}

console.log(
"🛡️ NIA GOVERNANCE ENGINE ONLINE"
);

audit();

setInterval(audit,300000);
