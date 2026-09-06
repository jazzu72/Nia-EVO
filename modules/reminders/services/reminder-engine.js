const fs=require('fs');

const FILE="./modules/followup/data/followups.json";

function read(){
try{
return JSON.parse(fs.readFileSync(FILE,'utf8'));
}catch{
return [];
}
}

function getReminders(){

const followups=read();

return followups
.filter(f=>f.status==="pending_contact")
.map(f=>({
address:f.address,
action:f.nextAction,
offer:f.offer,
priority:"HIGH"
}));

}

module.exports={getReminders};
