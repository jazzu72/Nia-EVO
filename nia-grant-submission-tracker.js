const fs=require("fs");

const INPUT="nia-final-submission-packages.json";
const OUTPUT="nia-grant-submission-tracker.json";

function track(){

if(!fs.existsSync(INPUT)){
console.log("❌ Submission packages missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const tracked=data.packages.map((p,i)=>({

trackingId:"TRACK-"+Date.now()+"-"+i,

grant:p.grant,

packageId:p.packageId,

status:"READY_FOR_SUBMISSION",

timeline:{
created:p.created,
submitted:null,
lastChecked:new Date().toISOString(),
nextFollowUp:"30_DAYS"
},

monitoring:{
responseCheck:true,
deadlineTracking:true,
agencyUpdates:true
},

actions:[
"OWNER_SUBMIT",
"CONFIRM_RECEIPT",
"MONITOR_AGENCY_RESPONSE",
"SEND_FOLLOW_UP_IF_NEEDED"
],

created:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT SUBMISSION TRACKER",
mode:"FUNDING_FIRST",
trackedGrants:tracked.length,
tracked
},null,2)
);

console.log("📡 GRANT SUBMISSION TRACKER ONLINE");
console.log("TRACKED:",tracked.length);

}

track();

setInterval(track,86400000);
