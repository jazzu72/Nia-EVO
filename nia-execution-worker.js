const fs = require("fs");

const FILE = "nia-action-execution.json";

function worker(){

if(!fs.existsSync(FILE)) return;

let tasks = JSON.parse(fs.readFileSync(FILE));

tasks = tasks.map(task=>{

if(task.status === "READY"){

console.log(
"⚙️ EXECUTING:",
task.task,
task.property
);

return {
...task,
status:"COMPLETED",
result:"ACTION_PROCESSED",
completedAt:new Date().toISOString()
};

}

return task;

});

fs.writeFileSync(
FILE,
JSON.stringify(tasks,null,2)
);

const completed = tasks.filter(
t=>t.status==="COMPLETED"
).length;

console.log(
"✅ COMPLETED TASKS:",
completed
);

}

console.log("⚙️ NIA EXECUTION WORKER ONLINE");

worker();

setInterval(worker,30000);
