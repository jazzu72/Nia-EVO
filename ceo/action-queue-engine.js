const fs=require("fs");

const FILE="./ceo/action-queue.json";

function load(){
 if(!fs.existsSync(FILE)) return [];
 return JSON.parse(fs.readFileSync(FILE));
}

function createAction(task){

 const queue=load();

 const action={
  id:"ACTION-"+Date.now(),
  title:task.title,
  priority:task.priority || "MEDIUM",
  category:task.category || "GENERAL",
  status:"OPEN",
  owner:"NIA",
  created:new Date().toISOString()
 };

 queue.push(action);

 fs.writeFileSync(FILE,JSON.stringify(queue,null,2));

 return action;
}

function dashboard(){

 const queue=load();

 return {
  system:"NIA AUTONOMOUS ACTION QUEUE",
  status:"ACTIVE",
  openTasks:queue.filter(x=>x.status==="OPEN").length,
  tasks:queue
 };
}

module.exports={
 createAction,
 dashboard
};
