const fs=require('fs');

const OPPS="./modules/opportunities/data/opportunities.json";
const SCORES="./modules/scoring/data/scores.json";
const OFFERS="./modules/offers/data/offers.json";
const {sendDealApproval}=require('../../notifications/deal-approval');

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

function write(file,data){
fs.writeFileSync(file,JSON.stringify(data,null,2));
}

function processOpportunities(){

const opportunities=read(OPPS);
const scores=read(SCORES);
const offers=read(OFFERS);

const results=opportunities.map(o=>{

const value=Number(o.estimatedValue||0);

const score=value>200000?70:40;

const analysis={
id:o.id,
address:o.address,
estimatedValue:value,
score,
rating:score>=60?"HIGH":"REVIEW",
status:"analyzed"
};

scores.push(analysis);

if(score>=60){
offers.push({
id:Date.now(),
address:o.address,
targetPrice:value*0.7,
status:"offer_ready",
created:new Date().toISOString()
});
sendDealApproval({address:o.address,targetPrice:value*0.7,id:Date.now()});
}

return analysis;

});

write(SCORES,scores);
write(OFFERS,offers);

return results;
}

module.exports={processOpportunities};
