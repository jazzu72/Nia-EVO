const scheduler=require("./scheduler-agent");
const notify=require("./notification-engine");
const fs=require("fs");

function cycle(){

 const state=scheduler.run();

 let previousOpenTasks = 0;

 try {
  const existing = JSON.parse(fs.readFileSync("./ceo/autonomous-state.json","utf8"));
  previousOpenTasks = Number(existing.openTasks || 0);
 } catch {}

 if(state.scan.openTasks > 0 && state.scan.openTasks !== previousOpenTasks){

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
  openTasks:state.scan.openTasks,
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
