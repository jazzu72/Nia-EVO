const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/security/audit.json"
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



function logAction(action){

const logs = load();

logs.push({

id:
"AUDIT-"+Date.now(),

action:
action.action,

user:
action.user || "NIA",

status:
action.status || "logged",

timestamp:
new Date().toISOString()

});


save(logs);

}



function checkPermission(role,action){

const permissions={

owner:[
"*"
],

admin:[
"read",
"write",
"execute"
],

agent:[
"read",
"analyze"
],

viewer:[
"read"
]

};


if(
permissions[role]?.includes("*")
)
return true;


return permissions[role]?.includes(action) || false;

}



function audit(){

return load()
.slice(-50)
.reverse();

}



module.exports={

logAction,

checkPermission,

audit

};

