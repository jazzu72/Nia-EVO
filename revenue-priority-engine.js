const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let ranked=(data.contacts||[])
.filter(c=>c.dealStatus!=="won")
.map(c=>{

let score=0;

score += (c.probability||0);
score += c.proposalSent ? 20 : 0;
score += c.priority==="HOT" ? 25 : 0;
score += ((c.activities||[]).filter(a=>a.type==="call").length)*5;
score += ((c.activities||[]).filter(a=>a.type==="email").length)*3;

c.revenueScore=score;

return c;

})
.sort((a,b)=>b.revenueScore-a.revenueScore);

data.revenueRanking=ranked.map(c=>({
name:c.name,
score:c.revenueScore,
priority:c.priority||"COLD",
action:c.nextBestAction||"Nurture lead"
}));

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log("💰 Revenue Priority Engine Updated");
data.revenueRanking.slice(0,10).forEach(x=>{
console.log(`${x.score} | ${x.priority} | ${x.name} | ${x.action}`);
});

