const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB="./modules/property-data/data/properties.json";

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

const properties=read();

const property={
id:Date.now(),
address:req.body.address||"Unknown",
arv:Number(req.body.arv||0),
price:Number(req.body.price||0),
repairs:Number(req.body.repairs||0),
leadId:req.body.leadId||null,
created:new Date().toISOString()
};

properties.push(property);
save(properties);

res.json({
success:true,
property
});

});

router.get('/all',(req,res)=>{
res.json({
system:"Nia Property Data Engine",
count:read().length,
properties:read()
});
});

module.exports=router;
