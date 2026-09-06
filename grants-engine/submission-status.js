const submission=require("./grant-submission-engine");

function getStatus(){

 const records=submission.dashboard();

 if(!records.length){
  return {
    status:"NO_SUBMISSIONS",
    message:"No grant submissions created"
  };
 }

 const latest=records[records.length-1];

 const completed=latest.checklist.filter(
  x=>x.status==="COMPLETE"
 ).length;

 const total=latest.checklist.length;

 const readiness=Math.round(
  (completed/total)*100
 );

 return {
   system:"NIA GRANT SUBMISSION INTELLIGENCE",
   status:"ACTIVE",

   grant:{
    name:latest.grant,
    amount:latest.amount
   },

   readiness:{
    score:readiness+"%",
    completed,
    total
   },

   checklist:latest.checklist,

   nextAction:
    readiness>=90
    ?"READY FOR SUBMISSION"
    :"Complete missing requirements",

   updated:new Date().toISOString()
 };
}

module.exports={
 getStatus
};
