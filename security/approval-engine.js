const fs = require("fs");


const FILE =
"data/security/approvals.json";


function load(){

if(!fs.existsSync(FILE))
fs.writeFileSync(
FILE,
"[]"
);

return JSON.parse(
fs.readFileSync(FILE)
);

}



function requestApproval(action){

const approvals=load();


const item={

id:
"APP-"+Date.now(),

action,

status:
"pending",

created:
new Date().toISOString()

};


approvals.push(item);


fs.writeFileSync(
FILE,
JSON.stringify(approvals,null,2)
);


return item;

}



function approve(id){

const approvals=load();


const item =
approvals.find(
x=>x.id===id
);


if(item)
item.status="approved";


fs.writeFileSync(
FILE,
JSON.stringify(approvals,null,2)
);


return item;

}


module.exports={

requestApproval,

approve

};

