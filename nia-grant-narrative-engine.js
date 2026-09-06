const fs=require("fs");

const INPUT="nia-ranked-grant-opportunities.json";
const OUTPUT="nia-grant-narrative-packages.json";

function generate(){

if(!fs.existsSync(INPUT)){
console.log("❌ Ranked grants missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const packages=data.opportunities.map(g=>({

grant:g.source,

applicationStrategy:"NON_DILUTIVE_CAPITAL_ACQUISITION",

narrative:{
executiveSummary:
"House of Jazzu is developing NIA Capital OS, an AI-powered operating platform designed to help businesses discover funding, manage operations, and accelerate growth.",

innovation:
"NIA combines artificial intelligence, automation, business intelligence, and capital workflow management into a unified operating system.",

marketNeed:
"Small businesses struggle to identify funding opportunities, organize applications, and efficiently manage growth resources.",

technicalApproach:
"Cloud-based AI workflows, automated opportunity discovery, scoring engines, and human approval controls.",

commercialImpact:
"NIA enables entrepreneurs and organizations to access capital resources faster while reducing administrative barriers.",

fundingUse:[
"AI platform development",
"Cloud infrastructure",
"Research and development",
"Customer acquisition"
]

},

readiness:"DRAFT_COMPLETE",

nextAction:"HUMAN_REVIEW_AND_SUBMISSION",

created:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT NARRATIVE ENGINE",
mode:"FUNDING_FIRST",
packages
},null,2)
);

console.log("📝 GRANT NARRATIVE ENGINE ONLINE");
console.log("NARRATIVES CREATED:",packages.length);

}

generate();

setInterval(generate,300000);
