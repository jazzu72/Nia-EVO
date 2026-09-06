const fs=require('fs');

const OFFERS="./modules/offers/data/offers.json";
const BUYERS="./modules/buyer-crm/data/buyers.json";
const MATCHES="./modules/buyer-matching/data/matches.json";

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

function save(file,data){
fs.mkdirSync(require('path').dirname(file),{recursive:true});
fs.writeFileSync(file,JSON.stringify(data,null,2));
}

function run(){

const offers=read(OFFERS);
const buyers=read(BUYERS);

const matches=[];

offers.forEach(offer=>{

buyers.forEach(buyer=>{

if(Number(buyer.budget)>=Number(offer.maxOffer||offer.price||0)){

matches.push({
id:Date.now()+matches.length,
property:offer.address,
buyer:buyer.name,
budget:buyer.budget,
status:"matched",
created:new Date().toISOString()
});

}

});

});

save(MATCHES,matches);

return matches;

}

module.exports={run};
