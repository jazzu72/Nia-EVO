const fs=require("fs");
const {exec}=require("child_process");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let changed=0;

data.contacts.forEach(c=>{

if(c.priority==="HOT" && !c.proposalSent && c.dealStatus!=="won"){

c.probability=80;
c.triggerProposal=true;
 c.proposalRequested=true;
 c.proposalRequested=true;
c.lastAction="Proposal requested by Hot Lead Engine";
c.lastUpdated=new Date().toISOString();

changed++;

}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`🚀 Triggered ${changed} hot lead proposals`);
