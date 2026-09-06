const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let stats={
 proposals:0,
 followUps:0,
 meetings:0,
 won:0,
 revenue:data.revenue||0
};

data.contacts.forEach(c=>{

if(c.proposalSent) stats.proposals++;
if(c.followUpScheduled) stats.followUps++;
if(c.dealStatus==="meeting") stats.meetings++;
if(c.dealStatus==="won") stats.won++;

});

data.conversionStats=stats;

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log("📈 Conversion Tracker Updated");
console.log(stats);
