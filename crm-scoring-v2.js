const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

function score(contact){

let p=10;

const a=contact.activities||[];

const calls=a.filter(x=>x.type==="call").length;
const emails=a.filter(x=>x.type==="email").length;
const followups=a.filter(x=>x.type==="followup").length;

p += Math.min(calls*8,32);
p += Math.min(emails*5,20);
p += Math.min(followups*10,20);

if(contact.score){
 p += Math.min(contact.score/5,20);
}

if(a.length>=5){
 p+=10;
}

if(contact.nextFollowUp){
 p+=5;
}

return Math.min(Math.round(p),99);

}

let data=JSON.parse(fs.readFileSync(FILE,'utf8'));

data.contacts.forEach(c=>{
 c.probability=score(c);
});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log("✅ CRM scoring upgraded");

data.contacts
.sort((a,b)=>b.probability-a.probability)
.slice(0,5)
.forEach(c=>{
 console.log(`${c.name}: ${c.probability}%`);
});
