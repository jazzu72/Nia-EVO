const deadline=require("../grants-engine/deadline-intelligence");
const funding=require("../grants-engine/funding-state-engine");

function generateBriefing(){

 const fundingState=funding.evaluateFunding();
 const deadlines=deadline.dashboard();

 return {

   system:"NIA CEO DAILY BRIEFING ENGINE",

   status:"ACTIVE",

   executiveSummary:{
     fundingDecision:fundingState.decision,
     readiness:fundingState.grantStatus.readiness.score
   },

   criticalActions:[
     {
       priority:"CRITICAL",
       action:fundingState.decision
     }
   ],

   fundingPipeline:{
     activeGrant:fundingState.grantStatus.grant,
     trackedDeadlines:deadlines.trackedGrants
   },

   recommendations:[
     "Complete pending funding requirements",
     "Review submission documents",
     "Monitor grant deadlines"
   ],

   generated:new Date().toISOString()

 };

}


module.exports={
 generateBriefing
};
