const fs=require('fs');

function logActivity(event,detail){
 const path="./modules/activity/data/activity.json";
 let data=[];
 try{
  data=JSON.parse(fs.readFileSync(path,"utf8"));
 }catch{}

 data.push({
  id:Date.now(),
  event,
  detail,
  timestamp:new Date().toISOString()
 });

 fs.mkdirSync("./modules/activity/data",{recursive:true});
 fs.writeFileSync(path,JSON.stringify(data.slice(-100),null,2));
}

const SCORES="./modules/scoring/data/scores.json";
const OFFERS="./modules/offers/data/offers.json";

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

function calculateOffer(property){

const arv=Number(property.arv||250000);
const repairs=Number(property.repairs||30000);
const profitTarget=Number(property.profitTarget||40000);

const maxOffer=arv-repairs-profitTarget;

return {
id:Date.now(),
address:property.address||"Unknown",
arv,
repairs,
maxOffer,
status:"offer_ready",
created:new Date().toISOString()
};

}

function run(){

const ranked=read(SCORES);

const offers=read(OFFERS);

const results=ranked
.filter(l=>l.priority==="HIGH")
.filter(l=>!offers.some(o=>o.address===l.address))
.map(calculateOffer);

save(OFFERS,[...offers,...results]);

results.forEach(o=>{
 logActivity(
  "offer_created",
  `Offer ready: ${o.address} | Max offer $${o.maxOffer}`
 );
});

return results;

}

module.exports={run};
