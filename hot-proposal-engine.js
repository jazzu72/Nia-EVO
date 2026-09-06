const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let created=0;

data.contacts.forEach(c=>{

if(c.priority==="HOT" && c.dealStatus!=="won" && !c.proposalRequested){

c.proposalRequested=true;
c.proposalRequestedAt=new Date().toISOString();
c.lastAction="Ready for proposal generation";

created++;

}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`📄 ${created} new proposals queued`);

