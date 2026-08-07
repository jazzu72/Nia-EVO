const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));
let escalated=0;

data.contacts.forEach(c=>{

if(c.dealStatus==="won") return;

let calls=(c.activities||[]).filter(a=>a.type==="call").length;
let emails=(c.activities||[]).filter(a=>a.type==="email").length;

if(c.probability>=40 && (calls>=2 || emails>=1)){
 c.priority="HOT";
 c.probability=Math.min((c.probability||40)+15,99);
 c.triggerProposal=true;
 c.lastAction="Escalated by Lead Engine";
 c.lastUpdated=new Date().toISOString();
 escalated++;
}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`🔥 Escalated ${escalated} leads`);

