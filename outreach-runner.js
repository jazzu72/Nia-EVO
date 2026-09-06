const fs=require("fs");
const crypto=require("crypto");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let processed=0;

data.outreachQueue=(data.outreachQueue||[]).map(q=>{

if(q.status==="READY"){

let c=data.contacts.find(x=>x.name===q.name);

if(c){

c.activities=c.activities||[];

c.activities.push({
id:crypto.randomBytes(4).toString("hex"),
type:"outreach",
note:`Automated outreach: ${q.action}`,
timestamp:new Date().toISOString()
});

c.lastAction=q.action;
c.lastActivity=new Date().toISOString();

processed++;

}

q.status="COMPLETED";
q.completedAt=new Date().toISOString();

}

return q;

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`📲 Outreach Runner completed ${processed} actions`);

