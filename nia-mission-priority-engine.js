const fs=require("fs");

const PRIORITY_FILE="nia-mission-priority.json";

const mission={
system:"NIA-CAPITAL-OS",
mode:"FUNDING_FIRST_EXECUTION",
priorityOrder:[
{
rank:1,
mission:"GRANTS",
objective:"Acquire non-dilutive capital",
status:"ACTIVE",
weight:50,
actions:[
"SCAN_ACTIVE_GRANTS",
"QUALIFY_APPLICATIONS",
"PREPARE_SUBMISSIONS",
"TRACK_DEADLINES"
]
},
{
rank:2,
mission:"REAL_ESTATE",
objective:"Convert capital into assets",
status:"ACTIVE",
weight:35,
actions:[
"VERIFY_DEALS",
"BUILD_INVESTOR_PACKAGES",
"PREPARE_EXIT_STRATEGIES"
]
},
{
rank:3,
mission:"INVESTOR_OUTREACH",
objective:"Secure strategic capital partners",
status:"ACTIVE",
weight:15,
actions:[
"SEND_PACKAGES",
"TRACK_RESPONSES",
"FOLLOW_UP"
]
}
],
controls:{
requireApprovalBeforeCapitalMovement:true,
auditEnabled:true,
executionLock:true
},
timestamp:new Date().toISOString()
};

fs.writeFileSync(
PRIORITY_FILE,
JSON.stringify(mission,null,2)
);

console.log("🚀 NIA MISSION PRIORITY LOCKED");
console.log("PRIMARY: GRANTS");
console.log("SECONDARY: REAL ESTATE");
console.log("TERTIARY: INVESTOR CAPITAL");
