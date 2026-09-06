const fs=require('fs');

const DB="./modules/closings/data/closings.json";

function createClosing(data){

let closings=[];

try{
closings=JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{}

const deal={
id:Date.now(),
address:data.address||"Unknown",
offer:data.offer||0,
status:"under_contract",
closeDate:data.closeDate||null,
created:new Date().toISOString()
};

closings.push(deal);

fs.writeFileSync(DB,JSON.stringify(closings,null,2));

return deal;
}

function getClosings(){
try{
return JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{
return [];
}
}

module.exports={createClosing,getClosings};
