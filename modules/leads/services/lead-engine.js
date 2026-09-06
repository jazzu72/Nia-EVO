const fs=require('fs');

const DB="./modules/leads/data/leads.json";

function addLead(data){

let leads=[];

try{
leads=JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{}

const lead={
id:Date.now(),
name:data.name||"Unknown",
phone:data.phone||"",
address:data.address||"",
source:data.source||"manual",
status:"new",
created:new Date().toISOString()
};

leads.push(lead);

fs.writeFileSync(DB,JSON.stringify(leads,null,2));

return lead;
}

function getLeads(){
try{
return JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{
return [];
}
}

module.exports={addLead,getLeads};
