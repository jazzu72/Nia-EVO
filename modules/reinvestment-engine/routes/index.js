const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB="./modules/reinvestment-engine/data/allocations.json";

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

router.post('/allocate',(req,res)=>{

const revenue=Number(req.body.revenue||0);

const allocation={
id:Date.now(),
revenue,
marketing:revenue*0.30,
operations:revenue*0.30,
reserves:revenue*0.20,
growth:revenue*0.20,
created:new Date().toISOString()
};

const list=read();
list.push(allocation);
save(list);

res.json({
success:true,
allocation
});

});

router.get('/all',(req,res)=>{
res.json({
system:"Nia Reinvestment Engine",
allocations:read()
});
});

module.exports=router;
