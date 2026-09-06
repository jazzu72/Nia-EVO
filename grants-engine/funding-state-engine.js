const readiness=require("./submission-status");
const execution=require("./grant-execution-bridge");

function evaluateFunding(){

 const status=readiness.getStatus();

 let decision="";

 if(status.status==="NO_SUBMISSIONS"){
   decision="CREATE_GRANT_PACKAGE";
 }

 else if(parseInt(status.readiness.score)<90){
   decision="COMPLETE_REQUIREMENTS";
 }

 else{
   decision="READY_FOR_SUBMISSION";
 }

 return {
   system:"NIA FUNDING STATE ENGINE",
   status:"ACTIVE",

   decision,

   grantStatus:status,

   execution:execution.executeFundingDecision(),

   timestamp:new Date().toISOString()
 };
}


module.exports={
 evaluateFunding
};
