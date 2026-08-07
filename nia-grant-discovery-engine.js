const fs=require("fs");

const OUTPUT="nia-grant-opportunities.json";

const opportunities=[
{
id:"NSF-SBIR",
source:"NSF",
type:"TECHNOLOGY_GRANT",
fitScore:95,
companyFit:[
"AI",
"SOFTWARE",
"FINTECH",
"INNOVATION"
],
status:"QUALIFICATION_READY"
},
{
id:"SBA-SBIR",
source:"SBA",
type:"SMALL_BUSINESS_GRANT",
fitScore:90,
companyFit:[
"STARTUP",
"TECHNOLOGY",
"COMMERCIALIZATION"
],
status:"QUALIFICATION_READY"
},
{
id:"VIRGINIA-INNOVATION",
source:"VIRGINIA_PROGRAMS",
type:"STATE_INNOVATION_FUNDING",
fitScore:88,
companyFit:[
"VIRGINIA_BUSINESS",
"AI",
"ECONOMIC_DEVELOPMENT"
],
status:"QUALIFICATION_READY"
}
];

const output={
system:"NIA GRANT DISCOVERY ENGINE",
mission:"FUNDING_FIRST",
pipelineStatus:"ACTIVE",
opportunities,
nextActions:[
"VERIFY_ELIGIBILITY",
"BUILD_GRANT_NARRATIVE",
"GENERATE_APPLICATION",
"SUBMISSION_REVIEW"
],
timestamp:new Date().toISOString()
};

fs.writeFileSync(
OUTPUT,
JSON.stringify(output,null,2)
);

console.log("🔎 NIA GRANT DISCOVERY ONLINE");
console.log("🎯 OPPORTUNITIES:",opportunities.length);
console.log("🏦 FUNDING MODE: NON-DILUTIVE");

