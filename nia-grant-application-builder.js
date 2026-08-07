const fs=require("fs");

const INPUT="nia-grant-execution-queue.json";
const OUTPUT="nia-grant-application-packages.json";

function build(){

if(!fs.existsSync(INPUT)){
console.log("❌ Grant queue missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const packages=data.queue.map(g=>({

applicationId:"APP-"+g.grantId,

grant:g.grantId,

source:g.source,

status:"DRAFT_READY",

sections:{
companyProfile:"House of Jazzu / NIA Capital OS",

innovationSummary:
"AI-powered operating system for capital discovery, business intelligence, and automated execution.",

problemStatement:
"Small businesses lack access to efficient funding discovery, capital planning, and operational intelligence.",

solution:
"NIA uses autonomous AI workflows to discover opportunities, organize capital strategy, and accelerate execution.",

commercializationPlan:
"Deploy SaaS-based AI business operating platform across startups, investors, and small businesses.",

useOfFunds:[
"Software development",
"Cloud infrastructure",
"AI research",
"Market expansion"
],

reviewStatus:"PENDING_HUMAN_APPROVAL"

},

created:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT APPLICATION BUILDER",
mode:"FUNDING_FIRST",
packages
},null,2)
);

console.log("📝 GRANT APPLICATION BUILDER ONLINE");
console.log("PACKAGES CREATED:",packages.length);

}

build();

setInterval(build,300000);
