const actionQueue=require("./action-queue-engine");
const deadline=require("../grants-engine/deadline-intelligence");

function run(){

 const tasks=actionQueue.dashboard();
 const deadlines=deadline.dashboard();

 return {
  system:"NIA AUTONOMOUS SCHEDULER AGENT",
  status:"ACTIVE",

  scan:{
   openTasks:tasks.openTasks,
   trackedDeadlines:deadlines.trackedGrants
  },

  actions:[
   "Review open CEO tasks",
   "Monitor grant deadlines",
   "Generate daily executive priorities"
  ],

  timestamp:new Date().toISOString()
 };

}

setInterval(()=>{
 console.log(
  JSON.stringify(run(),null,2)
 );
},60000);

module.exports={run};
