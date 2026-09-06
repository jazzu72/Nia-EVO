const fs = require("fs");
const path = require("path");

const TASK_DB =
path.join(__dirname,"../data/tasks/tasks.json");


function loadTasks(){

if(!fs.existsSync(TASK_DB)){
fs.writeFileSync(
TASK_DB,
JSON.stringify([],null,2)
);
}

return JSON.parse(
fs.readFileSync(TASK_DB)
);

}


function saveTasks(tasks){

fs.writeFileSync(
TASK_DB,
JSON.stringify(tasks,null,2)
);

}



function createTask(task){

const tasks = loadTasks();

const newTask = {

id:
"TASK-"+Date.now(),

title:
task.title,

priority:
task.priority || "MEDIUM",

department:
task.department || "CEO",

status:
"pending",

created:
new Date().toISOString()

};


tasks.push(newTask);

saveTasks(tasks);

return newTask;

}



function generateDailyTasks(){

let tasks=[];


// CRM

tasks.push(
createTask({

title:
"Review top CRM opportunities",

priority:
"HIGH",

department:
"SALES"

})
);


// Revenue

tasks.push(
createTask({

title:
"Check revenue pipeline",

priority:
"HIGH",

department:
"FINANCE"

})
);


// Funding

tasks.push(
createTask({

title:
"Scan funding opportunities",

priority:
"MEDIUM",

department:
"GRANTS"

})
);



return tasks;

}



function getPending(){

return loadTasks()
.filter(
t=>t.status==="pending"
);

}



module.exports={

createTask,
generateDailyTasks,
getPending

};

