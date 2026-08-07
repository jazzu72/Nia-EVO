const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

function monitor(){

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));
let alerts=[];

data.contacts.forEach(c=>{

if(c.proposalSent && c.dealStatus!=="won"){
 let days=(Date.now()-new Date(c.proposalSentAt||c.lastUpdated))/86400000;

 if(days>=3){
  c.priority="FOLLOW_UP";
  c.lastAction="Proposal requires follow-up";
  alerts.push(c.name);
 }
}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`📡 Deal Monitor: ${alerts.length} follow-ups needed`);

alerts.forEach(a=>console.log("⚡ "+a));

}

monitor();
setInterval(monitor,6*60*60*1000);
