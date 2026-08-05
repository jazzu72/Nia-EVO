const fs = require("fs");

const QUEUE = "execution-queue.json";
const MEMORY = "nia-deal-memory.json";

function remember(){

if(!fs.existsSync(QUEUE)) return;

const queue = JSON.parse(fs.readFileSync(QUEUE));

let memory = [];

if(fs.existsSync(MEMORY)){
memory = JSON.parse(fs.readFileSync(MEMORY));
}

queue.forEach(task=>{

const exists = memory.find(
m => m.property === task.property
);

if(!exists){

memory.push({
property: task.property,
firstSeen: new Date().toISOString(),
status: task.status,
confidence: task.confidence || null
});

console.log(
"🧠 DEAL REMEMBERED:",
task.property
);

}

});

fs.writeFileSync(
MEMORY,
JSON.stringify(memory,null,2)
);

}

console.log("🧠 NIA DEAL MEMORY ONLINE");

remember();

setInterval(remember,60000);
