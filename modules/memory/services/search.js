const fs=require('fs');

const DB="./modules/activity/data/activity.json";

function searchMemory(query){

let events=[];

try{
events=JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{
events=[];
}

return events.filter(e=>
JSON.stringify(e)
.toLowerCase()
.includes(String(query).toLowerCase())
);

}

module.exports={searchMemory};
