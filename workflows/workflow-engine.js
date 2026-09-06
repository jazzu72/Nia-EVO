const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/workflows/tasks.json"
);

const memory =
require("../memory/knowledge-engine");

function load(){

if(!fs.existsSync(DB)){

fs.writeFileSync(
DB,
JSON.stringify([],null,2)
);

}

return JSON.parse(
fs.readFileSync(DB)
);

}

const analytics =
require("../analytics/data-engine");

function save(data){

fs.writeFileSync(
DB,
JSON.stringify(data,null,2)
);

}

analytics.recordMetric({

name:"workflow_created",

value:1,

category:"operations"

});

function createWorkflow(item){

const workflows = load();


const workflow = {

id:
"FLOW-"+Date.now(),

name:
item.name,

type:
item.type || "business",

stage:
"discovered",

priority:
item.priority || "medium",

owner:
"NIA",

steps:[

"analysis",

"approval",

"execution",

"measurement"

],

created:
new Date().toISOString()

};


workflows.push(workflow);

save(workflows);


return workflow;

}



function advance(id,nextStage){

const workflows = load();


const item =
workflows.find(
x=>x.id===id
);


if(item){

item.stage=nextStage;

item.updated =
new Date().toISOString();

}


save(workflows);


return item;

}



function active(){

return load()
.filter(
x=>x.stage !== "complete"
);

}



module.exports={

createWorkflow,

advance,

active

};

memory.addMemory({

category:"workflow",

title:workflow.name,

content:
`Workflow moved to ${nextStage}`,

importance:"medium"

});

