const fs=require('fs');

const LEADS="./modules/leads/data/leads.json";
const SCORES="./modules/scoring/data/scores.json";

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

function analyzeLead(lead){

const scores=read(SCORES);

const estimate={
id:Date.now(),
address:lead.address,
source:lead.source,
arv:0,
price:0,
repairs:0,
score:0,
rating:"NEEDS_DATA",
status:"awaiting_property_data",
created:new Date().toISOString()
};

scores.push(estimate);

fs.writeFileSync(
SCORES,
JSON.stringify(scores,null,2)
);

return estimate;
}

function analyzeNewLeads(){

const leads=read(LEADS);

return leads.map(analyzeLead);

}

module.exports={analyzeLead,analyzeNewLeads};
