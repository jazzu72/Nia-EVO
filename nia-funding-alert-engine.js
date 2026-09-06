const fs=require("fs");

const INPUTS=[
"nia-grant-readiness-report.json",
"nia-grant-response-intelligence.json",
"nia-grant-submission-tracker.json"
];

const OUTPUT="nia-funding-alert-queue.json";

function alert(){

let alerts=[];

INPUTS.forEach(file=>{

if(!fs.existsSync(file)) return;

const data=JSON.parse(fs.readFileSync(file));

if(data.reports){
data.reports.forEach(g=>{
if(g.status==="UNDER_REVIEW"){
alerts.push({
type:"GRANT_REVIEW_PENDING",
grant:g.grant,
priority:"HIGH",
action:"MONITOR_RESPONSE"
});
}
});
}

if(Array.isArray(data.tracked)){
data.tracked.forEach(g=>{
if(g.status==="READY_FOR_SUBMISSION"){
alerts.push({
type:"SUBMISSION_PENDING",
grant:g.grant,
priority:"HIGH",
action:"OWNER_CONFIRM_SUBMISSION"
});
}
});
}

});

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA FUNDING ALERT ENGINE",
mode:"FUNDING_FIRST",
alertCount:alerts.length,
alerts,
updated:new Date().toISOString()
},null,2)
);

console.log("🚨 FUNDING ALERT ENGINE ONLINE");
console.log("ALERTS:",alerts.length);

}

alert();

setInterval(alert,3600000);
