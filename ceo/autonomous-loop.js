const scheduler=require("./scheduler-agent");
const notify=require("./notification-engine");
const fs=require("fs");

function cycle(){

 const state=scheduler.run();

 if(state.scan.openTasks>0){

  notify.send({
   type:"CEO_TASK",
   priority:"CRITICAL",
   message:`NIA detected ${state.scan.openTasks} open executive task(s) requiring review`
  });

 }

 const report={
  system:"NIA AUTONOMOUS EXECUTION LOOP",
  status:"ACTIVE",
  scheduler:state,
  notifications:notify.dashboard(),
  timestamp:new Date().toISOString()
 };

 fs.writeFileSync(
  "./ceo/autonomous-state.json",
  JSON.stringify(report,null,2)
 );

 return report;
}

setInterval(cycle,60000);

console.log(JSON.stringify(cycle(),null,2));

module.exports={cycle};
