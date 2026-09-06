const fs=require("fs");

const revenue=require("../revenue/revenue-engine");
const tasks=require("../tasks/task-engine");

function run(){

 const dashboard=revenue.dashboard();

 let actions=[];

 if(dashboard.totalDeals>0){

   actions.push(
    tasks.create(
     "Follow up on active revenue opportunities",
     "HIGH"
    )
   );

 }

 actions.push(
  tasks.create(
   "Review available grant opportunities",
   "HIGH"
  )
 );

 actions.push(
  tasks.create(
   "Search for new acquisition targets",
   "NORMAL"
  )
 );


 return {

  system:"NIA CAPITAL AUTONOMOUS LOOP",

  status:"RUNNING",

  revenue:{
   deals:dashboard.totalDeals,
   pipeline:dashboard.pipelineValue
  },

  actions,

  timestamp:new Date().toISOString()

 };

}


module.exports={run};
