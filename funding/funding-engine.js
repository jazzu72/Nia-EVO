const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/funding/opportunities.json"
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



function calculateFundingScore(item){

let score = 0;


// Amount

if(item.amount >= 1000000)
score += 40;

else if(item.amount >= 250000)
score += 30;

else if(item.amount >= 50000)
score += 20;



// Type

if(item.type==="grant")
score += 25;

if(item.type==="investor")
score += 30;

if(item.type==="sponsorship")
score += 20;



// Fit

if(item.ai)
score += 15;

if(item.education)
score += 10;

if(item.community)
score += 10;



// Deadline

if(item.deadline)
score += 10;



return score;

}



function addFunding(item){

const funding = load();


const entry = {

id:
"FUND-"+Date.now(),

organization:
item.organization || "",

type:
item.type || "grant",

amount:
Number(item.amount || 0),

deadline:
item.deadline || "",

score:
calculateFundingScore(item),

status:
"discovered",

created:
new Date().toISOString()

};


funding.push(entry);

save(funding);


return entry;

}



function prioritize(){

return load()
.sort(
(a,b)=>b.score-a.score
)
.slice(0,10);

}



function updateStatus(id,status){

const funding = load();

const item =
funding.find(
x=>x.id===id
);


if(!item)
return null;


item.status=status;

save(funding);


return item;

}



module.exports={

addFunding,

prioritize,

updateStatus

};

