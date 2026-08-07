const fs=require("fs");
const crypto=require("crypto");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

data.outreachQueue=data.outreachQueue||[];

(data.tasks||[])
.filter(t=>t.status==="OPEN")
.forEach(t=>{

let exists=data.outreachQueue.find(q=>q.taskId===t.id);

if(!exists){

data.outreachQueue.push({
 id:crypto.randomBytes(4).toString("hex"),
 taskId:t.id,
 name:t.name,
 priority:t.priority,
 action:t.action,
 status:"READY",
 createdAt:new Date().toISOString()
});

t.status="QUEUED";

}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log("📞 Outreach Execution Queue Updated");

data.outreachQueue
.filter(q=>q.status==="READY")
.slice(0,10)
.forEach(q=>{
console.log(`${q.priority} | ${q.name} | ${q.action}`);
});

