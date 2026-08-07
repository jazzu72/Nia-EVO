const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

data.outreachQueue=data.outreachQueue||[];

let added=0;

data.contacts.forEach(c=>{

if(
 c.priority==="HOT" &&
 c.dealStatus!=="won" &&
 !data.outreachQueue.find(x=>x.id===c.id)
){

data.outreachQueue.push({
 id:c.id,
 name:c.name,
 company:c.company,
 action:"Call + proposal follow-up",
 priority:"HIGH",
 createdAt:new Date().toISOString()
});

c.lastAction="Added to outreach queue";
c.lastUpdated=new Date().toISOString();

added++;

}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`📞 Outreach Queue Added: ${added}`);
console.log(data.outreachQueue);

