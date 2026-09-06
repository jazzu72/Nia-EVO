const fs = require("fs");

const INPUT = "nia-action-execution.json";
const OUTPUT = "nia-outreach-queue.json";

function outreach(){

if(!fs.existsSync(INPUT)) return;

const tasks = JSON.parse(fs.readFileSync(INPUT));

let queue = [];

if(fs.existsSync(OUTPUT)){
queue = JSON.parse(fs.readFileSync(OUTPUT));
}

tasks.forEach(task=>{

if(task.status === "COMPLETED" && task.priority === "HIGH"){

const exists = queue.find(
q => q.executionId === task.executionId
);

if(!exists){

const contact = {
outreachId:"OUTREACH-"+Date.now(),
executionId:task.executionId,
property:task.property,
channel:"PENDING",
action:"SELLER_CONTACT_REQUIRED",
status:"READY",
created:new Date().toISOString()
};

queue.push(contact);

console.log(
"📡 OUTREACH CREATED:",
task.property
);

}

}

});

fs.writeFileSync(
OUTPUT,
JSON.stringify(queue,null,2)
);

console.log(
"📨 OUTREACH QUEUE SIZE:",
queue.length
);

}

console.log("📡 NIA OUTREACH ENGINE ONLINE");

outreach();

setInterval(outreach,60000);
