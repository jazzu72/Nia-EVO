const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB='./modules/realestate/data/pipeline.json';

function load(){
 return JSON.parse(fs.readFileSync(DB));
}

function save(data){
 fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.get('/',(req,res)=>{
 res.json(load());
});

router.post('/',(req,res)=>{
 let deals=load();

 const deal={
  id:Date.now(),
  address:req.body.address,
  seller:req.body.seller,
  status:req.body.status || "lead",
  amount:Number(req.body.amount || 0),
  created:new Date().toISOString()
 };

 deals.push(deal);
 save(deals);

 res.json({success:true,deal});
});

router.put('/:id',(req,res)=>{
 let deals=load();

 deals=deals.map(d=>{
  if(d.id==req.params.id){
   d.status=req.body.status || d.status;
  }
  return d;
 });

 save(deals);

 res.json({success:true});
});

module.exports=router;
