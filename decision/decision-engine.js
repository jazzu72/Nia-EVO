const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/decisions/history.json"
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



function evaluate(opportunity){

let score = 0;
let reasons = [];


// VALUE

if(opportunity.amount){

if(opportunity.amount >= 1000000){

score += 40;
reasons.push("High capital opportunity");

}

else if(opportunity.amount >= 250000){

score += 25;
reasons.push("Strong financial value");

}

else if(opportunity.amount >= 50000){

score += 15;

}

}


// TYPE

switch(opportunity.type){

case "grant":
score += 25;
reasons.push("Non-dilutive funding");
break;

case "investor":
score += 20;
reasons.push("Growth capital");
break;

case "contract":
score += 20;
reasons.push("Revenue opportunity");
break;

case "partnership":
score += 15;
break;

}


// STRATEGIC ALIGNMENT

if(opportunity.ai){

score += 15;
reasons.push("AI aligned");

}


if(opportunity.quantum){

score += 15;
reasons.push("Quantum aligned");

}


let decision;


if(score >=80){

decision="EXECUTE";

}

else if(score >=60){

decision="HIGH PRIORITY";

}

else if(score >=40){

decision="REVIEW";

}

else{

decision="REJECT";

}



const result={

id:
"DEC-"+Date.now(),

opportunity:
opportunity.title,

score,

decision,

reasons,

created:
new Date().toISOString()

};


const history = load();

history.push(result);

save(history);


return result;

}



function history(){

return load();

}



module.exports={

evaluate,

history

};

