const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB="./modules/closing-tracker/data/closings.json";

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

const closings=read();

const closing={
id:Date.now(),
property:req.body.property||"Unknown",
buyer:req.body.buyer||"Unknown",
amount:Number(req.body.amount||0),
stage:"under_contract",
nextAction:"closing coordination",
revenue:0,
created:new Date().toISOString()
};

closings.push(closing);
save(closings);

res.json({
success:true,
closing
});

});

router.post('/complete/:id',(req,res)=>{

const closings=read();

const closing=closings.find(c=>String(c.id)===req.params.id);

if(!closing){
return res.status(404).json({error:"Closing not found"});
}

closing.stage="closed";
closing.revenue=Number(req.body.revenue||0);
closing.closedAt=new Date().toISOString();

save(closings);

res.json({
success:true,
closing
});

});

router.get('/all',(req,res)=>{
res.json({
system:"Nia Closing Tracker",
count:read().length,
closings:read()
});
});

module.exports=router;
