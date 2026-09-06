const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB="./modules/deal-packets/data/packets.json";

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

const packets=read();

const packet={
id:Date.now(),
address:req.body.address||"Unknown",
arv:Number(req.body.arv||0),
purchasePrice:Number(req.body.purchasePrice||0),
repairs:Number(req.body.repairs||0),
projectedProfit:Number(req.body.projectedProfit||0),
status:"investor_ready",
created:new Date().toISOString()
};

packets.push(packet);
save(packets);

res.json({
success:true,
packet
});

});

router.get('/all',(req,res)=>{
res.json({
system:"Nia Deal Packet Engine",
count:read().length,
packets:read()
});
});

module.exports=router;
