const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/strategy/plans.json"
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



function calculatePriority(goal){

let score = 0;


if(goal.revenue)
score += 30;


if(goal.funding)
score += 25;


if(goal.customers)
score += 20;


if(goal.ai)
score += 15;


if(goal.deadline)
score += 10;


return score;

}



function createGoal(goal){

const plans = load();


const item = {

id:
"GOAL-"+Date.now(),

title:
goal.title,

description:
goal.description || "",

category:
goal.category || "business",

priority:
calculatePriority(goal),

status:
"planned",

deadline:
goal.deadline || "",

created:
new Date().toISOString()

};


plans.push(item);

save(plans);


return item;

}



function updateGoal(id,status){

const plans = load();


const goal =
plans.find(
x=>x.id===id
);


if(goal){

goal.status=status;

}


save(plans);


return goal;

}



function recommend(){

return load()

.sort(
(a,b)=>
b.priority-a.priority
)

.slice(0,5);

}



module.exports={

createGoal,

updateGoal,

recommend

};

