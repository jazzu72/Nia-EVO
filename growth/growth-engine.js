const fs = require("fs");
const path = require("path");


const DB = path.join(
__dirname,
"../data/growth/leads.json"
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



function scoreLead(lead){

let score = 0;


if(lead.company)
score += 10;


if(lead.email)
score += 5;


if(lead.budget){

if(lead.budget >= 100000)
score += 40;

else if(lead.budget >= 25000)
score += 25;

else
score += 10;

}


if(lead.industry==="government")
score += 20;


if(lead.industry==="enterprise")
score += 20;


if(lead.need==="AI")
score += 15;


return score;

}



function addLead(lead){

const data=load();


const item={

id:
"LEAD-"+Date.now(),

...lead,

score:
scoreLead(lead),

status:
"new",

created:
new Date().toISOString()

};


data.push(item);

save(data);

return item;

}



function funnel(){

const data=load();


return {

total:data.length,

new:
data.filter(
x=>x.status==="new"
).length,


contacted:
data.filter(
x=>x.status==="contacted"
).length,


converted:
data.filter(
x=>x.status==="converted"
).length,


conversionRate:
data.length ?
(
data.filter(
x=>x.status==="converted"
).length
/
data.length
*100
).toFixed(2)
:0

};


}



module.exports={
addLead,
funnel,
load
};

