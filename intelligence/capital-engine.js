const fs = require("fs");
const path = require("path");


const DB = path.join(
__dirname,
"../data/capital-intelligence.json"
);



function load(){

if(!fs.existsSync(DB)){
 return [];
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



function analyze(opportunity){

let score = 0;
let reasons=[];


// Funding size
if(opportunity.amount){

if(opportunity.amount >= 1000000){
 score += 40;
 reasons.push("Million dollar opportunity");
}

else if(opportunity.amount >= 250000){
 score += 25;
 reasons.push("Large funding");
}

else if(opportunity.amount >= 50000){
 score += 15;
 reasons.push("Meaningful funding");
}

}


// Strategic alignment

if(opportunity.ai){

score += 20;
reasons.push("AI aligned");

}


if(opportunity.education){

score += 15;
reasons.push("Education aligned");

}


if(opportunity.quantum){

score += 20;
reasons.push("Quantum aligned");

}


// Company fit

if(opportunity.startup){

score += 10;
reasons.push("Startup friendly");

}



let recommendation="LOW PRIORITY";


if(score >=80)
 recommendation="EXECUTE";

else if(score >=60)
 recommendation="HIGH PRIORITY";

else if(score >=40)
 recommendation="REVIEW";


return {

...opportunity,

capitalScore:score,

recommendation,

reasons,

analyzedAt:
new Date().toISOString()

};


}



function addOpportunity(item){

const data=load();

const result=analyze(item);

data.push(result);

save(data);

return result;

}



function top(){

return load()
.sort(
(a,b)=>b.capitalScore-a.capitalScore
)
.slice(0,10);

}



module.exports={
addOpportunity,
top,
analyze
};

