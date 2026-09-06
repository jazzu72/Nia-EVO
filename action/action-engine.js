const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/actions/tasks.json"
);



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



function save(data){

fs.writeFileSync(
DB,
JSON.stringify(data,null,2)
);

}



function createAction(task){

const actions = load();


const action = {

id:
"ACTION-"+Date.now(),

title:
task.title,

type:
task.type || "business",

priority:
task.priority || "normal",

status:
"pending",

assigned:
task.assigned || "Nia",

created:
new Date().toISOString()

};


actions.push(action);

save(actions);


return action;

}



function completeAction(id){

const actions = load();

const action =
actions.find(
a=>a.id===id
);


if(!action)
return null;


action.status="completed";

action.completed=
new Date().toISOString();


save(actions);


return action;

}



function getActions(){

return load();

}



function pending(){

return load()
.filter(
a=>a.status==="pending"
);

}



module.exports={

createAction,

completeAction,

getActions,

pending

};

