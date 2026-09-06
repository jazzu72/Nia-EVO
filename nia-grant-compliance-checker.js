const fs=require("fs");

const INPUT="nia-auto-grant-drafts.json";
const OUTPUT="nia-grant-compliance-report.json";

function check(){

if(!fs.existsSync(INPUT)){
console.log("❌ Grant drafts missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const reports=data.drafts.map(d=>{

const checks={
companyProfile:!!d.application.company,
innovationSummary:!!d.application.innovation,
problemStatement:!!d.application.problem,
solutionDescription:!!d.application.solution,
impactStatement:!!d.application.impact,
ownerReviewRequired:d.reviewRequired
};

const passed=Object.values(checks).filter(Boolean).length;

return {
grant:d.grant,
draftId:d.draftId,
complianceScore:Math.round((passed/Object.keys(checks).length)*100),
status:passed===Object.keys(checks).length
?"COMPLIANCE_READY"
:"NEEDS_REVIEW",
checks,
nextAction:
passed===Object.keys(checks).length
?"QUEUE_FOR_FINAL_REVIEW"
:"COMPLETE_MISSING_SECTIONS"
};

});

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT COMPLIANCE CHECKER",
mode:"FUNDING_FIRST",
checked:reports.length,
reports,
timestamp:new Date().toISOString()
},null,2)
);

console.log("🛡️ GRANT COMPLIANCE CHECKER ONLINE");
console.log("CHECKED:",reports.length);

}

check();

setInterval(check,3600000);
