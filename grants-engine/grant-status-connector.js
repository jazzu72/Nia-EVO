const submission = require("./grant-submission-engine");

function getGrantStatus(){

 const apps = submission.dashboard();

 if(!apps.length){
   return {
     status:"NO_APPLICATIONS",
     message:"No grant submissions created"
   };
 }

 const latest = apps[apps.length-1];

 return {
   status:"ACTIVE",
   grant:latest.grant,
   amount:latest.amount,
   applicationId:latest.id,
   stage:latest.status,
   company:latest.company,
   created:latest.created
 };
}

module.exports={
 getGrantStatus
};
