const fs=require("fs");
const FILE="./data/tasks.json";

function load(){
 if(!fs.existsSync(FILE)) fs.writeFileSync(FILE,"[]");
 return JSON.parse(fs.readFileSync(FILE));
}

function save(d){
 fs.writeFileSync(FILE,JSON.stringify(d,null,2));
}

function create(title,priority="NORMAL"){
 let tasks=load();
 let task={
  id:"TASK-"+Date.now(),
  title,
  priority,
  status:"OPEN",
  created:new Date().toISOString()
 };
 tasks.push(task);
 save(tasks);
 return task;
}

function all(){
 return load();
}

module.exports={create,all};
