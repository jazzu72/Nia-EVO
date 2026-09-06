const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));
let alerts=0;

data.contacts.forEach(c=>{

if(c.dealStatus==="won") return;

let daysInactive=0;

if(c.lastActivity){
 daysInactive=Math.floor((Date.now()-new Date(c.lastActivity))/86400000);
}

if(c.proposalSent && daysInactive>=3){
 c.priority="HOT";
 c.lastAction="Stalled proposal escalation";
 c.followUp={
  status:"URGENT",
  action:"Immediate follow-up required",
  createdAt:new Date().toISOString()
 };
 alerts++;
}

});

data.dealAlerts=alerts;

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`🚨 Deal health alerts: ${alerts}`);

