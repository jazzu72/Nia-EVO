const fs = require("fs");

const INPUT = "nia-actions.json";
const OUTPUT = "nia-action-execution.json";

function execute(){

if(!fs.existsSync(INPUT)) return;

const actions = JSON.parse(fs.readFileSync(INPUT));

let executions = [];

if(fs.existsSync(OUTPUT)){
 executions = JSON.parse(fs.readFileSync(OUTPUT));
}

actions.forEach(action=>{

const exists = executions.find(
e=>e.actionId === action.id
);

if(!exists){

const execution = {
executionId:"EXEC-ACTION-"+Date.now(),
actionId:action.id,
property:action.property,
task:action.action,
priority:action.priority,
status:"READY",
created:new Date().toISOString()
};

executions.push(execution);

console.log(
"🚀 ACTION QUEUED:",
execution.task,
execution.property
);

}

});

fs.writeFileSync(
OUTPUT,
JSON.stringify(executions,null,2)
);

console.log(
"📦 TOTAL EXECUTION TASKS:",
executions.length
);

}

console.log("🚀 NIA ACTION EXECUTOR ONLINE");

execute();

setInterval(execute,60000);
