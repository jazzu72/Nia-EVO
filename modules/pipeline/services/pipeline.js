const fs=require('fs');

const LEADS="./modules/leads/data/leads.json";
const DEALS="./modules/scanner/data/opportunities.json";

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

function buildPipeline(){

const leads=read(LEADS);
const deals=read(DEALS);

return {
system:"Nia Acquisition Pipeline",
status:"online",

stages:{
newLeads:leads.filter(x=>x.status==="new").length,
analyzedDeals:deals.length,
goodDeals:deals.filter(x=>x.recommendation==="GOOD DEAL").length
},

nextActions:[
"Contact seller",
"Analyze property",
"Prepare offer"
],

timestamp:new Date().toISOString()
};

}

module.exports={buildPipeline};
