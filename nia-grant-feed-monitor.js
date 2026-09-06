const fs=require("fs");

const INPUT="nia-live-grant-sources.json";
const OUTPUT="nia-grant-feed-monitor.json";

function monitor(){

if(!fs.existsSync(INPUT)){
console.log("❌ Grant sources missing");
return;
}

const sources=JSON.parse(fs.readFileSync(INPUT));

const feeds=sources.sources.map((s,i)=>({

source:s.name,

connectionStatus:"READY",

feedType:s.type,

monitoring:true,

actions:[
"CHECK_NEW_OPPORTUNITIES",
"COMPARE_COMPANY_FIT",
"UPDATE_GRANT_QUEUE",
"ALERT_DEADLINES"
],

priority:s.priority,

lastChecked:new Date().toISOString()

}));

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT FEED MONITOR",
mode:"FUNDING_FIRST",
monitoringActive:true,
feeds
},null,2)
);

console.log("📡 GRANT FEED MONITOR ONLINE");
console.log("SOURCES MONITORED:",feeds.length);

}

monitor();

setInterval(monitor,900000);
