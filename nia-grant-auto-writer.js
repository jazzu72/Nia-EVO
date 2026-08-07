const fs=require("fs");

const INPUT="nia-funding-opportunity-router.json";
const OUTPUT="nia-auto-grant-drafts.json";

function write(){

if(!fs.existsSync(INPUT)){
console.log("❌ Funding opportunity router missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const drafts=data.opportunities.map((g,i)=>({

draftId:"DRAFT-"+Date.now()+"-"+i,

grant:g.source,

fitScore:g.fitScore,

status:"DRAFT_GENERATED",

application:{
company:"House of Jazzu",
platform:"NIA Capital OS",

executiveSummary:
"House of Jazzu is developing NIA Capital OS, an AI-powered business operating platform that helps organizations discover funding opportunities, automate workflows, and accelerate growth.",

innovation:
"An intelligent capital operating system combining AI automation, opportunity discovery, business intelligence, and execution workflows.",

problem:
"Small businesses and innovators struggle to identify, prepare, and manage funding opportunities efficiently.",

solution:
"NIA provides an AI-driven workflow for finding capital opportunities, preparing applications, and managing execution.",

impact:
"Reduce barriers to capital access and improve startup growth outcomes."

},

reviewRequired:true,

nextAction:[
"OWNER_REVIEW",
"ADD_GRANT_SPECIFIC_REQUIREMENTS",
"PREPARE_FINAL_SUBMISSION"
],

created:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT AUTO-WRITER",
mode:"FUNDING_FIRST",
draftCount:drafts.length,
drafts
},null,2)
);

console.log("✍️ GRANT AUTO-WRITER ONLINE");
console.log("DRAFTS CREATED:",drafts.length);

}

write();

setInterval(write,3600000);
