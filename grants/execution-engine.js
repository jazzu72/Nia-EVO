const fs = require("fs");
const path = require("path");


const DB =
path.join(__dirname,"../data/grant-execution.json");


function load(){

if(!fs.existsSync(DB)){
fs.writeFileSync(DB,JSON.stringify([],null,2));
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


// Create grant execution plan

function createPlan(grant){

const plans = load();


const plan = {

id:
"GRANT-"+Date.now(),

title:
grant.title,

organization:
grant.organization || "",

amount:
grant.amount || 0,


deadline:
grant.deadline || "Unknown",


status:
"Preparation",


checklist:[

{
task:"Company profile",
complete:true
},

{
task:"Executive summary",
complete:false
},

{
task:"Budget document",
complete:false
},

{
task:"Technical description",
complete:false
},

{
task:"Impact statement",
complete:false
}

],


created:
new Date().toISOString()

};


plans.push(plan);

save(plans);


return plan;

}



function updateChecklist(id,task){

const plans=load();

const plan =
plans.find(
p=>p.id===id
);


if(!plan)
return null;


const item =
plan.checklist.find(
x=>x.task===task
);


if(item)
item.complete=true;


plan.status =
plan.checklist.every(
x=>x.complete
)
?
"READY FOR SUBMISSION"
:
"IN PROGRESS";


save(plans);


return plan;

}



function getPlans(){

return load();

}



module.exports={

createPlan,
updateChecklist,
getPlans

};

