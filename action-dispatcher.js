const fs=require("fs");
const crypto=require("crypto");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

data.tasks=data.tasks||[];

(data.revenueRanking||[]).slice(0,10).forEach(c=>{

let exists=data.tasks.find(t=>t.name===c.name && t.status==="OPEN");

if(!exists){

data.tasks.push({
 id:crypto.randomBytes(4).toString("hex"),
 name:c.name,
 priority:c.priority,
 action:c.action,
 status:"OPEN",
 createdAt:new Date().toISOString()
});

}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log("⚡ Action Dispatcher Updated");

data.tasks
.filter(t=>t.status==="OPEN")
.slice(0,10)
.forEach(t=>{
console.log(`${t.priority} | ${t.name} | ${t.action}`);
});

