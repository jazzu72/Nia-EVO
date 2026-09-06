const fs=require("fs");

const FILE="./grants-engine/submission-tracker.json";


function load(){

 if(!fs.existsSync(FILE)){
   return [];
 }

 return JSON.parse(fs.readFileSync(FILE));

}


function createSubmission(grant){

 const submissions=load();

 const submission={

   id:"SUB-"+Date.now(),

   grant:{
     name:grant.name,
     amount:grant.amount
   },

   status:"READY",

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
       item:"Milestones",
       status:"COMPLETE"
     },

     {
       item:"Budget",
       status:"COMPLETE"
     },

     {
       item:"Founder Information",
       status:"COMPLETE"
     },

     {
       item:"Financial Documents",
       status:"COMPLETE"
     }

   ],

   submission:{
     method:"ONLINE_APPLICATION",
     deadline:"TRACKING_REQUIRED"
   },

   created:new Date().toISOString()

 };


 submissions.push(submission);

 fs.writeFileSync(
 FILE,
 JSON.stringify(submissions,null,2)
 );


 return submission;

}


function dashboard(){

 return {
   system:"NIA SUBMISSION CONTROL CENTER",
   submissions:load()
 };

}


module.exports={
 createSubmission,
 dashboard
};
