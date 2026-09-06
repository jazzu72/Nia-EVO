const tasks=require("../tasks/task-engine");

function status(){

 const all=tasks.all();

 return {
  system:"NIA FUNDING ENGINE",
  openTasks:all.filter(t=>t.status==="OPEN").length,
  tasks:all
 };

}

module.exports={status};
