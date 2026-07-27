const funding=require("./funding-state-engine");
const requirements=require("./requirement-completion-engine");

function orchestrate(){

 const readiness=requirements.readiness();

 let action="";

 if(readiness.readiness==="100%"){
   action="READY_FOR_SUBMISSION";
 }
 else{
   action="COMPLETE_REQUIREMENTS";
 }

 return {
   system:"NIA FUNDING ORCHESTRATOR",
   status:"ACTIVE",

   readiness:{
     score:readiness.readiness,
     missing:readiness.missing
   },

   decision:action,

   nextSteps:
     action==="READY_FOR_SUBMISSION"
     ?
     [
       "Generate final grant package",
       "Review submission checklist",
       "Submit application"
     ]
     :
     [
       "Complete missing requirements",
       ...readiness.missing
     ],

   timestamp:new Date().toISOString()
 };

}

module.exports={
 orchestrate
};
