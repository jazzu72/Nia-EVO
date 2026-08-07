const fs=require("fs");
const crypto=require("crypto");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let updated=0;

(data.outreachQueue||[]).forEach(q=>{

let c=data.contacts.find(x=>x.id===q.id);

if(c && !c.activities.some(a=>a.type==="outreach")){

c.activities.push({
 id:crypto.randomBytes(4).toString("hex"),
 type:"outreach",
 note:"Lead entered automated outreach workflow",
 timestamp:new Date().toISOString()
});

c.lastActivity=new Date().toISOString();
c.lastAction="Outreach logged";

updated++;

}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`📞 Outreach activities logged: ${updated}`);

