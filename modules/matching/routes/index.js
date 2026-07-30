const express=require('express');
const router=express.Router();
const fs=require('fs');
const {sendMatchAlert}=require('../../notifications/match-alert');

const DB="./modules/matching/data/matches.json";

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

function save(data){
fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.get('/run',(req,res)=>{

const investors=read("./modules/investor-crm/data/investors.json");
const deals=read("./modules/deal-packets/data/packets.json");

const matches=[];

deals.forEach(deal=>{

investors.forEach(investor=>{

matches.push({
id:Date.now()+matches.length,
deal:deal.address,
investor:investor.name,
fit:"potential",
status:"review",
created:new Date().toISOString()
});
sendMatchAlert(matches[matches.length-1]);

});

});

save(matches);

res.json({
success:true,
matches
});

});

router.get('/all',(req,res)=>{
res.json({
system:"Nia Capital Matching Engine",
matches:read()
});
});

module.exports=router;
