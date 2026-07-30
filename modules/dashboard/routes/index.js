const express=require('express');
const router=express.Router();

const fs=require('fs');
const scores=()=>{try{return JSON.parse(fs.readFileSync('./modules/scoring/data/scores.json','utf8'));}catch{return []}};
const packets=()=>{try{return JSON.parse(fs.readFileSync('./modules/deal-packets/data/packets.json','utf8'));}catch{return []}};

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

router.get('/overview',(req,res)=>{

const offers=read('./modules/offers/data/offers.json');
const properties=scores();
const deals=packets();
const closings=read('./modules/closings/data/closings.json');
const actions=read('./modules/audit/data/audit.log')
.split('\n')
.filter(Boolean);

res.json({

system:"Nia Capital OS Executive Dashboard",

status:"online",

metrics:{
offers:offers.length,
topDeals:properties.filter(p=>p.score>=30).length,
bestScore:properties.length?Math.max(...properties.map(p=>p.score)):0,
investorPackets:deals.filter(d=>d.status==='investor_ready').length,
underContract:closings.filter(c=>c.status==="under_contract").length,
auditEvents:actions.length,
uptime:Math.floor(process.uptime())
},

services:{
api:"online",
telegram:"online",
revenue:"online",
realEstate:"online"
},

timestamp:new Date().toISOString()

});

});

module.exports=router;
