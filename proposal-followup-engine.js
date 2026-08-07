const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));
let queued=0;

data.contacts.forEach(c=>{

if(c.proposalSent && c.dealStatus!=="won"){

c.followUp={
 status:"READY",
 nextAction:"Follow up on proposal",
 scheduledAt:new Date(Date.now()+24*60*60*1000).toISOString()
};

c.lastAction="Proposal follow-up scheduled";
queued++;

}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`📞 Follow-ups scheduled: ${queued}`);

