const grants=require("../grants-engine/grant-command-engine");
const priority=require("../decision/priority-engine");

function fundingDecision(){

 const grantData=grants.dashboard();
 const tasks=priority.prioritize();

 const grantValue=grantData.totalFundingRequested || 0;
 const topTask=tasks[0] || {};

 let recommendation;

 if(grantValue > 100000){
   recommendation={
    action:"EXECUTE GRANT STRATEGY",
    reason:"Non-dilutive funding opportunity exceeds revenue task value",
    fundingPotential:grantValue
   };
 } else {
   recommendation={
    action:topTask.title || "Build pipeline",
    reason:"Revenue operations currently have priority",
    fundingPotential:0
   };
 }

 return {
  system:"NIA CAPITAL ALLOCATION ENGINE",
  status:"ONLINE",
  recommendation,
  grantPipeline:grantData,
  revenuePriority:topTask,
  generated:new Date().toISOString()
 };
}

module.exports={
 fundingDecision
};
