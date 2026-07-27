const fs = require("fs");
const path = require("path");


const DB = path.join(
__dirname,
"../data/strategy/decisions.json"
);



function save(data){

fs.writeFileSync(
DB,
JSON.stringify(data,null,2)
);

}



function load(){

if(!fs.existsSync(DB)){
 return [];
}

return JSON.parse(
fs.readFileSync(DB)
);

}



function evaluate(action){

let score = 0;
let reasons=[];


// Money impact

if(action.value){

if(action.value >= 1000000){
score += 50;
reasons.push("Million dollar impact");
}

else if(action.value >=250000){
score +=30;
reasons.push("Large financial impact");
}

else if(action.value >=50000){
score +=20;
reasons.push("Meaningful opportunity");
}

}


// Speed

if(action.deadline){

score +=15;
reasons.push("Deadline sensitive");

}


// Strategic fit

if(action.type==="grant"){
score +=20;
reasons.push("Funding aligned");
}


if(action.type==="customer"){
score +=25;
reasons.push("Revenue generating");
}


if(action.type==="investor"){
score +=25;
reasons.push("Capital expansion");
}



let priority="LOW";


if(score>=80)
priority="EXECUTE NOW";

else if(score>=60)
priority="HIGH";

else if(score>=40)
priority="REVIEW";



return {

action:
action.name,

score,

priority,

reasons,

created:
new Date().toISOString()

};

}



function createDecision(action){

const decisions=load();

const result=evaluate(action);

decisions.push(result);

save(decisions);

return result;

}



function topActions(){

return load()
.sort(
(a,b)=>b.score-a.score
)
.slice(0,10);

}



module.exports={
createDecision,
topActions
};

