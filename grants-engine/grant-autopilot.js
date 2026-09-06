const tasks=require("../tasks/task-engine");

function run(){
 let task=tasks.create(
  "Prepare highest priority grant application package",
  "HIGH"
 );

 return {
  system:"NIA GRANT AUTOPILOT",
  status:"ACTIVE",
  task
 };
}

module.exports={run};
