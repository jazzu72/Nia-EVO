const fs=require("fs");

const FILE="./grants-engine/submissions.json";

function load(){
 if(!fs.existsSync(FILE)) return [];
 return JSON.parse(fs.readFileSync(FILE));
}

function save(data){
 fs.writeFileSync(FILE,JSON.stringify(data,null,2));
}

function createSubmission(grant){

 const submission={
   id:"SUB-"+Date.now(),
   grant:grant.name,
   amount:grant.amount,
   company:"House of Jazzu",
   status:"IN_PROGRESS",

   checklist:[
    {
     item:"Executive Summary",
     status:"COMPLETE"
    },
    {
     item:"Problem Statement",
     status:"COMPLETE"
    },
    {
     item:"Innovation Description",
     status:"COMPLETE"
    },
    {
     item:"Milestone Plan",
     status:"COMPLETE"
    },
    {
     item:"Budget",
     status:"COMPLETE"
    },
    {
     item:"Founder Information",
     status:"PENDING"
    },
    {
     item:"Financial Documents",
     status:"PENDING"
    }
   ],

   readinessScore:71,

   nextAction:
   "Complete founder information and financial documentation",

   created:new Date().toISOString()
 };

 const db=load();
 db.push(submission);
 save(db);

 return submission;
}


function dashboard(){
 return load();
}


module.exports={
 createSubmission,
 dashboard
};
