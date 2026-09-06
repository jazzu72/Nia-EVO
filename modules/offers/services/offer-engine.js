const fs=require('fs');

const DB="./modules/offers/data/offers.json";

function createOffer(data){

let offers=[];

try{
offers=JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{}

const arv=Number(data.arv||0);
const repairs=Number(data.repairs||0);
const desiredProfit=Number(data.desiredProfit||0);
const closing=Number(data.closingCosts||0);
const holding=Number(data.holdingCosts||0);

const offer=arv-repairs-closing-holding-desiredProfit;

const result={
id:Date.now(),
address:data.address||"Unknown",
arv,
repairs,
offerPrice:offer,
profitTarget:desiredProfit,
status:"prepared",
created:new Date().toISOString()
};

offers.push(result);

fs.writeFileSync(DB,JSON.stringify(offers,null,2));

return result;
}

function getOffers(){
try{
return JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{
return [];
}
}

module.exports={createOffer,getOffers};
