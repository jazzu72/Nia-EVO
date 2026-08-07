const fs=require("fs");

const INPUT="nia-funding-alert-queue.json";
const OUTPUT="nia-owner-notifications.json";

function notify(){

if(!fs.existsSync(INPUT)){
console.log("❌ Alert queue missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const notifications=(data.alerts||[]).map((a,i)=>({

notificationId:"NOTICE-"+Date.now()+"-"+i,

priority:a.priority,

type:a.type,

grant:a.grant,

message:
`NIA Funding Alert: ${a.grant} requires action: ${a.action}`,

delivery:[
"DASHBOARD",
"OWNER_LOG"
],

status:"PENDING_REVIEW",

created:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA OWNER NOTIFICATION ENGINE",
mode:"FUNDING_FIRST",
notifications:notifications.length,
notifications
},null,2)
);

console.log("📢 OWNER NOTIFICATION ENGINE ONLINE");
console.log("NOTIFICATIONS:",notifications.length);

}

notify();

setInterval(notify,3600000);
