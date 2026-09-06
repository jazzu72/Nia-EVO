const express=require('express');
const router=express.Router();
const fs=require('fs');

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

router.get('/overview',(req,res)=>{

const leads=read("./modules/leads/data/leads.json");
const offers=read("./modules/offers/data/offers.json");
const investors=read("./modules/investor-crm/data/investors.json");
const matches=read("./modules/matching/data/matches.json");
const deals=read("./modules/crm/data/deals.json");

res.json({
system:"Nia Capital Command Center",
status:"online",
metrics:{
leads:leads.length,
offers:offers.length,
investors:investors.length,
matches:matches.length,
closingPipeline:deals.length
},
executiveView:{
topOffers:offers.slice(-5),
recentMatches:matches.slice(-5),
activeDeals:deals.slice(-5)
},
timestamp:new Date().toISOString()
});

});

module.exports=router;
