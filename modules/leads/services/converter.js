const fs=require('fs');

const LEADS="./modules/leads/data/leads.json";
const PIPELINE="./modules/pipeline/data/pipeline.json";

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

function convertLead(id){

const leads=read(LEADS);
const deals=read(PIPELINE);

const lead=leads.find(l=>String(l.id)===String(id));

if(!lead){
return {success:false,error:"Lead not found"};
}

const deal={
id:Date.now(),
lead:lead.name,
phone:lead.phone,
type:lead.type,
stage:"new",
source:"Nia Lead Engine",
created:new Date().toISOString()
};

deals.push(deal);
write(PIPELINE,deals);

lead.converted=true;
lead.dealId=deal.id;
write(LEADS,leads);

return {
success:true,
message:"Lead converted to deal",
deal
};

}

module.exports={convertLead};
