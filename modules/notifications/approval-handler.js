const fs=require('fs');

const OFFERS="./modules/offers/data/offers.json";

function read(){
try{
return JSON.parse(fs.readFileSync(OFFERS,'utf8'));
}catch{
return [];
}
}

function save(data){
fs.writeFileSync(OFFERS,JSON.stringify(data,null,2));
}

function handleApproval(text){

const offers=read();

if(text.startsWith("/approve_")){

const id=text.replace("/approve_","");

const offer=offers.find(o=>String(o.id)===id);

if(offer){
offer.status="approved";
offer.approvedAt=new Date().toISOString();
save(offers);

return "✅ Deal approved: "+offer.address;
}

}

if(text.startsWith("/reject_")){

const id=text.replace("/reject_","");

const offer=offers.find(o=>String(o.id)===id);

if(offer){
offer.status="rejected";
offer.rejectedAt=new Date().toISOString();
save(offers);

return "❌ Deal rejected: "+offer.address;
}

}

return null;

}

module.exports={handleApproval};
