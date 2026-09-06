const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB="./modules/buyer-crm/data/buyers.json";

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

router.post('/add',(req,res)=>{

const buyers=read();

const buyer={
id:Date.now(),
name:req.body.name||"Unknown",
contact:req.body.contact||"",
market:req.body.market||"Norfolk",
strategy:req.body.strategy||"cash-buyer",
budget:Number(req.body.budget||0),
status:"active",
created:new Date().toISOString()
};

buyers.push(buyer);
save(buyers);

res.json({
success:true,
buyer
});

});

router.get('/all',(req,res)=>{
res.json({
system:"Nia Buyer Database",
count:read().length,
buyers:read()
});
});

module.exports=router;
