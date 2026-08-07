const fs=require("fs");

const PIPELINE="data/revenue-pipeline.json";

function loadPipeline(){
  if(!fs.existsSync(PIPELINE)){
    return {deals:[]};
  }
  return JSON.parse(fs.readFileSync(PIPELINE));
}

function savePipeline(data){
  fs.writeFileSync(
    PIPELINE,
    JSON.stringify(data,null,2)
  );
}

async function closeDeal(dealId){

const pipeline=loadPipeline();

const deal=pipeline.deals.find(
d=>d.id===dealId
);

if(!deal){
console.log("❌ Deal not found");
return null;
}

deal.stage="closed";
deal.closedAt=new Date().toISOString();
deal.revenue=deal.amount;

savePipeline(pipeline);

console.log(
`💰 DEAL CLOSED: ${deal.address || "Unknown"} $${deal.amount || 0}`
);

try{
const revenue=require("./revenue/report");
if(revenue.sendRevenueReport){
revenue.sendRevenueReport();
}
}catch(e){
console.log("⚠️ Revenue report unavailable");
}

try{
const telegram=require("./telegram-interface");
if(telegram.sendToPhone){
telegram.sendToPhone(
`💰 Deal closed: ${deal.address} – $${deal.amount.toLocaleString()}`
);
}
}catch(e){
console.log("⚠️ Telegram notification unavailable");
}

return deal;

}

module.exports={closeDeal};
