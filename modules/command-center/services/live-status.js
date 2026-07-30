const fs=require('fs');

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

function getLiveStatus(){

const deals=read('./modules/realestate/data/deals.json');
const business=read('./modules/business/data/business.json');
const activity=read('./modules/activity/data/activity.json');
const opportunities=read('./modules/scanner/data/opportunities.json');
const offers=read('./modules/offers/data/offers.json');
const closings=read('./modules/closings/data/closings.json');
const offersRevenue=read('./modules/offers/data/offers.json');

return {
system:"Nia Command Center",
status:"online",

metrics:{
deals:deals.length,
customers:business.customers?.length||0,
leads:business.leads?.length||0,
activities:activity.length,
opportunities:opportunities.length,
recommendedDeals:opportunities.filter(o=>o.recommendation==='GOOD DEAL').length,
offers:offers.length,
activeOffers:offers.filter(o=>o.status==='prepared').length,
closings:closings.length,
underContract:closings.filter(c=>c.status==='under_contract').length,
projectedRevenue:offersRevenue.reduce((sum,o)=>sum+Number(o.profitTarget||0),0)
},

engines:{
realEstate:"online",
business:"online",
memory:"online",
reports:"online",
scheduler:"online",
telegram:process.env.TELEGRAM_BOT_TOKEN?"online":"standby"
},

timestamp:new Date().toISOString()
};

}

module.exports={getLiveStatus};
