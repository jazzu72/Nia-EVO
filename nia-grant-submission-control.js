const fs=require("fs");

const INPUT="nia-grant-narrative-packages.json";
const OUTPUT="nia-grant-submission-control.json";

function control(){

if(!fs.existsSync(INPUT)){
console.log("❌ Grant narratives missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const submissions=data.packages.map((g,i)=>({

submissionId:"SUBMISSION-"+Date.now()+"-"+i,

grant:g.grant,

status:"READY_FOR_REVIEW",

checklist:{
eligibilityVerified:false,
narrativeComplete:true,
budgetPrepared:false,
documentsAttached:false,
finalApproval:false
},

priority:"HIGH",

deadlineStatus:"TRACKING",

requiredActions:[
"VERIFY_ELIGIBILITY",
"PREPARE_BUDGET",
"ATTACH_DOCUMENTS",
"FINAL_HUMAN_APPROVAL",
"SUBMIT_APPLICATION"
],

created:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT SUBMISSION CONTROL",
mode:"FUNDING_FIRST",
activeSubmissions:submissions.length,
submissions
},null,2)
);

console.log("📋 GRANT SUBMISSION CONTROL ONLINE");
console.log("ACTIVE SUBMISSIONS:",submissions.length);

}

control();

setInterval(control,300000);
