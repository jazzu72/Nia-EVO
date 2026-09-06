const fs=require("fs");

const FILE="./grants-engine/deadline-tracker.json";

function load(){
 if(!fs.existsSync(FILE)) return [];
 return JSON.parse(fs.readFileSync(FILE));
}

function addGrant(grant){

 const grants=load();

 const item={
   id:"DEADLINE-"+Date.now(),

   grant:grant.name,

   amount:grant.amount,

   deadline:grant.deadline,

   priority:grant.priority || "HIGH",

   status:"TRACKING",

   created:new Date().toISOString()
 };

 grants.push(item);

 fs.writeFileSync(FILE,JSON.stringify(grants,null,2));

 return item;
}


function dashboard(){

 const grants=load();

 return {
   system:"NIA DEADLINE INTELLIGENCE ENGINE",
   status:"ACTIVE",
   trackedGrants:grants.length,
   grants
 };

}


module.exports={
 addGrant,
 dashboard
};
