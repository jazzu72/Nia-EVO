const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB="./modules/followup/data/followups.json";

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

const list=read();

const item={
id:Date.now(),
address:req.body.address||"Unknown",
contact:req.body.contact||"",
offer:req.body.offer||0,
status:"pending_contact",
nextAction:"Call seller",
created:new Date().toISOString()
};

list.push(item);
save(list);

res.json({
success:true,
followup:item
});

});

router.get('/all',(req,res)=>{
res.json({
system:"Nia Seller Follow-Up",
count:read().length,
followups:read()
});
});

module.exports=router;
