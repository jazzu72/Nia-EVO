const fs=require('fs');

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

function generateActions(){

const leads=read('./modules/leads/data/leads.json');
const deals=read('./modules/scanner/data/opportunities.json');
const offers=read('./modules/offers/data/offers.json');

const actions=[];

if(leads.length===0)
actions.push("Acquire seller leads");

if(leads.length>0)
actions.push("Follow up with seller leads");

if(deals.length>0)
actions.push("Review analyzed properties");

if(offers.length>0)
actions.push("Review active offers");

actions.push("Check daily revenue pipeline");

return {
system:"Nia Executive Actions Engine",
status:"online",
priorityCount:actions.length,
actions,
timestamp:new Date().toISOString()
};

}

module.exports={generateActions};
