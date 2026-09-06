const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

data.contacts.forEach(c=>{

let score=c.score||0;
let activities=c.activities||[];

let probability=10;

probability += Math.min(activities.filter(a=>a.type==="call").length*8,32);
probability += Math.min(activities.filter(a=>a.type==="email").length*5,20);

if(score>=90) probability+=20;
else if(score>=70) probability+=15;

if(c.type==="AI_SERVICE") probability+=10;
if(c.type==="REAL_ESTATE") probability+=5;

if(c.outreachSent) probability+=10;

c.probability=Math.min(probability,99);

if(c.probability>=70){
 c.priority="HOT";
}else if(c.probability>=40){
 c.priority="WARM";
}else{
 c.priority="COLD";
}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log("🔥 Hot Lead Engine Updated");

data.contacts
.sort((a,b)=>b.probability-a.probability)
.slice(0,10)
.forEach(c=>console.log(`${c.priority} ${c.name}: ${c.probability}%`));
