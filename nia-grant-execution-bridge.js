const fs=require("fs");

const INPUT="nia-grant-execution-board.json";
const OUTPUT="nia-execution-queue.json";

function bridge(){

if(!fs.existsSync(INPUT)){
console.log("❌ Grant execution board missing");
return;
}

const grants=JSON.parse(fs.readFileSync(INPUT));

let existing=[];

if(fs.existsSync(OUTPUT)){
existing=JSON.parse(fs.readFileSync(OUTPUT)).tasks || [];
}

const grantTasks=grants.tasks.map(g=>({

id:g.taskId,

type:"GRANTS",

mission:"FUNDING_FIRST",

action:g.workflow[0],

source:g.source,

priority:g.priority,

status:g.status,

workflow:g.workflow,

approvalRequired:g.approvalRequired,

created:g.created

}));

const merged=[
...grantTasks,
...existing.filter(t=>t.type!=="GRANTS")
];

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA EXECUTION QUEUE",
mode:"FUNDING_FIRST",
grantIntegration:true,
taskCount:merged.length,
tasks:merged
},null,2)
);

console.log("🔗 GRANT EXECUTION BRIDGE ONLINE");
console.log("GRANT TASKS:",grantTasks.length);
console.log("TOTAL QUEUE:",merged.length);

}

bridge();

setInterval(bridge,60000);
