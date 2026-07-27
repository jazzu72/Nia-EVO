const fs = require("fs");
const path = require("path");

const DB =
path.join(
__dirname,
"../data/calendar/deadlines.json"
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



function calculateUrgency(deadline){

const now = new Date();

const due = new Date(deadline);

const days = Math.ceil(
(due-now)/(1000*60*60*24)
);


if(days <= 7)
return "CRITICAL";


if(days <= 30)
return "HIGH";


if(days <= 90)
return "MEDIUM";


return "LOW";

}




function addDeadline(item){

const calendar = load();


const entry = {

id:
"DEADLINE-"+Date.now(),

title:
item.title,

organization:
item.organization || "",

amount:
item.amount || 0,

deadline:
item.deadline,

urgency:
calculateUrgency(item.deadline),

status:
"ACTIVE",

created:
new Date().toISOString()

};


calendar.push(entry);

save(calendar);


return entry;

}



function upcoming(){

return load()
.sort(
(a,b)=>
new Date(a.deadline)-new Date(b.deadline)
);

}



module.exports={

addDeadline,

upcoming,

calculateUrgency

};

