const fs=require("fs");

const INPUT="nia-grant-submission-control.json";
const OUTPUT="nia-grant-status-memory.json";
const REPORT="nia-monthly-grant-report.json";

function update(){

if(!fs.existsSync(INPUT)){
console.log("❌ Submission control missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const grants=data.submissions.map(g=>({

grant:g.grant,
submissionId:g.submissionId,

currentStatus:g.status,

tracking:{
lastChecked:new Date().toISOString(),
nextFollowUp:new Date(Date.now()+30*86400000).toISOString(),
responseReceived:false
},

actions:[
"CHECK_STATUS",
"OWNER_NOTIFICATION",
"UPDATE_APPLICATION",
"PREPARE_FOLLOW_UP"
]

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT STATUS MEMORY",
mode:"LONG_TERM_TRACKING",
trackedGrants:grants.length,
grants
},null,2)
);


fs.writeFileSync(
REPORT,
JSON.stringify({
system:"NIA MONTHLY GRANT REPORT",
period:new Date().toISOString().slice(0,7),
summary:{
tracked:grants.length,
pendingResponses:grants.length,
awardedFunds:0
},
nextActions:[
"REVIEW_PENDING_GRANTS",
"FOLLOW_UP_WITH_PROGRAMS",
"UPDATE_PIPELINE"
]
},null,2)
);


console.log("🧠 GRANT STATUS MEMORY ONLINE");
console.log("TRACKED:",grants.length);
console.log("REPORT GENERATED");

}

update();

setInterval(update,86400000);
