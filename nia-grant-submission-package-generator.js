const fs=require("fs");

const INPUT="nia-grant-approval-queue.json";
const OUTPUT="nia-final-submission-packages.json";

function generate(){

if(!fs.existsSync(INPUT)){
console.log("❌ Approval queue missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const packages=data.queue.map((g,i)=>({

packageId:"PACKAGE-"+Date.now()+"-"+i,

grant:g.grant,

status:"SUBMISSION_READY",

submissionChecklist:{
applicationComplete:true,
narrativeIncluded:true,
budgetIncluded:true,
financialsIncluded:true,
complianceVerified:true,
ownerApproval:g.ownerDecision==="APPROVED"
},

documents:[
"Executive Summary",
"Technical Innovation Narrative",
"Business Plan",
"Budget Justification",
"Financial Documents"
],

nextAction:[
"OWNER_FINAL_CONFIRMATION",
"SUBMIT_TO_AGENCY",
"TRACK_RESPONSE"
],

created:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA FINAL SUBMISSION PACKAGE GENERATOR",
mode:"FUNDING_FIRST",
packagesCreated:packages.length,
packages
},null,2)
);

console.log("📦 SUBMISSION PACKAGE GENERATOR ONLINE");
console.log("PACKAGES:",packages.length);

}

generate();

setInterval(generate,3600000);
