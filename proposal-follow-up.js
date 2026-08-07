const fs=require("fs");
const FILE="./data/revenue-pipeline.json";

function run(){
let data=JSON.parse(fs.readFileSync(FILE,"utf8"));
let updated=0;

(data.contacts||[]).forEach(c=>{
 if(c.proposalSent && !c.followUpScheduled && c.dealStatus!=="won"){
   c.followUpScheduled=true;
   c.followUpDate=new Date(Date.now()+48*60*60*1000).toISOString();
   c.nextBestAction="Follow up on proposal and request decision";
   updated++;
 }
});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));
console.log(`📅 Proposal follow-ups scheduled: ${updated}`);
}

run();
setInterval(run,6*60*60*1000);
