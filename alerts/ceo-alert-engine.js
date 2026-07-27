const fs = require("fs");
const path = require("path");


const LOG =
path.join(
__dirname,
"../data/ceo-alerts.json"
);



function load(){

if(!fs.existsSync(LOG)){

fs.writeFileSync(
LOG,
JSON.stringify([],null,2)
);

}

return JSON.parse(
fs.readFileSync(LOG)
);

}



function save(data){

fs.writeFileSync(
LOG,
JSON.stringify(data,null,2)
);

}



function createAlert(alert){

const alerts = load();

const item = {

id:
"ALERT-"+Date.now(),

priority:
alert.priority || "NORMAL",

title:
alert.title,

message:
alert.message,

created:
new Date().toISOString(),

status:
"NEW"

};


alerts.push(item);

save(alerts);

return item;

}



function getAlerts(){

return load()
.reverse();

}



function criticalAlerts(){

return load()
.filter(
a=>a.priority==="HIGH"
||
a.priority==="CRITICAL"
);

}



module.exports={

createAlert,

getAlerts,

criticalAlerts

};

