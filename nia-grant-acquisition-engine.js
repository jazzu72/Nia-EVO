const fs=require("fs");

const OUTPUT="nia-grant-pipeline.json";

const grants=[
{
id:"GRANT-001",
source:"NSF",
category:"TECHNOLOGY_INNOVATION",
priority:1,
status:"TARGET",
requirements:[
"COMPANY_PROFILE",
"INNOVATION_SUMMARY",
"COMMERCIALIZATION_PLAN",
"TEAM_INFORMATION"
]
},
{
id:"GRANT-002",
source:"SBIR",
category:"SMALL_BUSINESS_RESEARCH",
priority:1,
status:"TARGET",
requirements:[
"TECHNICAL_PROPOSAL",
"BUDGET",
"MARKET_PLAN"
]
},
{
id:"GRANT-003",
source:"FEDERAL_SMALL_BUSINESS",
category:"CAPITAL_SUPPORT",
priority:2,
status:"TARGET",
requirements:[
"BUSINESS_PLAN",
"USE_OF_FUNDS",
"IMPACT_STATEMENT"
]
}
];

const pipeline={
system:"NIA GRANT ACQUISITION ENGINE",
mode:"FUNDING_FIRST",
mission:"NON_DILUTIVE_CAPITAL",
targets:grants,
nextActions:[
"SCAN_ACTIVE_GRANTS",
"SCORE_ELIGIBILITY",
"GENERATE_APPLICATION_PACKETS",
"TRACK_DEADLINES",
"SUBMISSION_READY_REVIEW"
],
timestamp:new Date().toISOString()
};

fs.writeFileSync(
OUTPUT,
JSON.stringify(pipeline,null,2)
);

console.log("💰 NIA GRANT ENGINE ONLINE");
console.log("🎯 GRANTS TARGETED:",grants.length);
console.log("🚀 MODE: FUNDING FIRST");

