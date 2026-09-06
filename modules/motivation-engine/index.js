const fs=require('fs');

const LEADS="./modules/lead-scanner/data/sources.json";
const SCORES="./modules/scoring/data/scores.json";

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

function save(file,data){
fs.writeFileSync(file,JSON.stringify(data,null,2));
}

function calculateMotivation(lead){

let score=0;

const reason=(lead.motivation||"").toLowerCase();

if(reason.includes("foreclosure")) score+=40;
if(reason.includes("tax")) score+=30;
if(reason.includes("vacant")) score+=25;
if(reason.includes("high")) score+=20;

return {
id:lead.id,
address:lead.address,
source:lead.source,
motivationScore:Math.min(score,100),
priority:score>=50?"HIGH":"NORMAL",
status:"ranked"
};

}

function run(){

const leads=read(LEADS);
const results=leads.map(calculateMotivation);

save(SCORES,results);

return results;

}

module.exports={run};
