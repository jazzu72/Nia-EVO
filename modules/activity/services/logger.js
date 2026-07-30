const fs=require('fs');

const DB="./modules/activity/data/activity.json";

function logActivity(type,message,data={}){

let events=[];

try{
events=JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{}

events.push({
id:Date.now(),
type,
message,
data,
timestamp:new Date().toISOString()
});

fs.writeFileSync(DB,JSON.stringify(events,null,2));

return true;
}

module.exports={logActivity};
