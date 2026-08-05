const fs = require("fs");

const INPUT = "nia-action-execution.json";
const OUTPUT = "nia-revenue-attribution.json";

function attribute(){

if(!fs.existsSync(INPUT)) return;

const tasks = JSON.parse(fs.readFileSync(INPUT));

let revenue = [];

tasks.forEach(task=>{

if(task.status === "COMPLETED"){

const exists = revenue.find(
r => r.executionId === task.executionId
);

if(!exists){

const record = {
executionId: task.executionId,
property: task.property,
action: task.task,
estimatedValue:
task.priority === "HIGH" ? 5000 : 1000,
status:"ATTRIBUTED",
timestamp:new Date().toISOString()
};

revenue.push(record);

console.log(
"💰 VALUE ATTRIBUTED:",
task.property,
record.estimatedValue
);

}

}

});

fs.writeFileSync(
OUTPUT,
JSON.stringify(revenue,null,2)
);

const total = revenue.reduce(
(sum,r)=>sum+r.estimatedValue,0
);

console.log(
"💵 NIA ESTIMATED PIPELINE VALUE:",
total
);

}

console.log("💰 NIA REVENUE ATTRIBUTION ONLINE");

attribute();

setInterval(attribute,60000);
