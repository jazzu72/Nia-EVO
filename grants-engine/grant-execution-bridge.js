const tasks = require("../tasks/task-engine");
const grants = require("./grant-hunter");

function executeFundingDecision(){

 const grant = grants.topGrants()[0];

 if(!grant){
   return {
     status:"NO_GRANT_AVAILABLE"
   };
 }

 const createdTasks=[
   tasks.create(
    `Complete ${grant.name} application`,
    "CRITICAL"
   ),

   tasks.create(
    `Review ${grant.name} requirements`,
    "HIGH"
   ),

   tasks.create(
    `Prepare ${grant.name} submission documents`,
    "HIGH"
   )
 ];

 return {
   system:"NIA GRANT EXECUTION BRIDGE",
   status:"ACTIVE",
   grant:{
     name:grant.name,
     amount:grant.amount
   },
   tasks:createdTasks
 };
}

module.exports={
 executeFundingDecision
};
