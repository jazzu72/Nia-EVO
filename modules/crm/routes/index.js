const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB="./modules/crm/data/deals.json";

function read(){
try{
return JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{
return [];
}
}

function save(data){
fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.post('/create',(req,res)=>{

const deals=read();

const deal={
id:Date.now(),
address:req.body.address||"Unknown",
offer:req.body.offer||0,
stage:"approved",
nextStep:"contact seller",
created:new Date().toISOString()
};

deals.push(deal);
save(deals);

res.json({
success:true,
deal
});

});

router.get('/pipeline',(req,res)=>{
res.json({
system:"Nia Closing Pipeline",
count:read().length,
deals:read()
});
});

module.exports=router;
