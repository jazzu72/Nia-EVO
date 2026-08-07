const fs=require("fs");

const INPUT="nia-grant-status-memory.json";
const OUTPUT="nia-grant-alert-queue.json";

function notify(){

if(!fs.existsSync(INPUT)){
console.log("❌ Grant status memory missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const alerts=data.grants.map((g,i)=>({

alertId:"GRANT-ALERT-"+Date.now()+"-"+i,

grant:g.grant,

type:"FUNDING_UPDATE",

priority:"HIGH",

message:
`${g.grant} requires review. Status: ${g.currentStatus}. Next follow-up: ${g.tracking.nextFollowUp}`,

actions:[
"OWNER_REVIEW",
"CHECK_PROGRAM_STATUS",
"GENERATE_RESPONSE",
"UPDATE_PIPELINE"
],

delivery:[
"LOCAL_DASHBOARD",
"SMS_READY",
"EMAIL_READY"
],

created:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT NOTIFICATION AGENT",
mode:"FUNDING_FIRST",
alertsActive:alerts.length,
alerts
},null,2)
);

console.log("🔔 GRANT NOTIFICATION AGENT ONLINE");
console.log("ALERTS CREATED:",alerts.length);

}

notify();

setInterval(notify,86400000);
