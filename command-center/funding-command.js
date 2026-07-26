const fs = require("fs");
const path = require("path");


const DB = path.join(
__dirname,
"../data/funding-command.json"
);


function load(){

if(!fs.existsSync(DB)){
 fs.writeFileSync(
 DB,
 JSON.stringify([],null,2)
 );
}

return JSON.parse(
fs.readFileSync(DB)
);

}



function save(data){

fs.writeFileSync(
DB,
JSON.stringify(data,null,2)
);

}



function addFunding(source){

const data = load();


const item={

id:
"CAP-"+Date.now(),

name:
source.name || "",

type:
source.type || "grant",

amount:
Number(source.amount || 0),

deadline:
source.deadline || "",

contact:
source.contact || "",

status:
"research",

priority:
calculatePriority(source),

created:
new Date().toISOString()

};


data.push(item);

save(data);

return item;

}



function calculatePriority(item){

let score=0;


if(item.amount >= 1000000)
score+=50;

else if(item.amount >=250000)
score+=30;

else if(item.amount >=50000)
score+=20;


if(item.type==="grant")
score+=20;


if(item.type==="investor")
score+=25;


if(item.ai)
score+=15;


if(item.quantum)
score+=15;


return score;

}



function dashboard(){

const data=load();


return {

total:
data.length,

highPriority:
data.filter(
x=>x.priority>=70
).length,


active:
data.filter(
x=>x.status!=="closed"
).length,


fundingTarget:
data.reduce(
(a,b)=>a+b.amount,
0
),


updated:
new Date().toISOString()

};


}



module.exports={
addFunding,
dashboard,
load
};

