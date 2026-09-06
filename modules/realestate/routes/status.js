const express=require('express');
const fs=require('fs');
const router=express.Router();

const DB='./modules/realestate/data/deals.json';

function load(){
  try{
    return JSON.parse(fs.readFileSync(DB,'utf8'));
  }catch{
    return [];
  }
}

function save(data){
  fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.post('/:id',(req,res)=>{
  const deals=load();
  const deal=deals.find(d=>String(d.id)===String(req.params.id));

  if(!deal){
    return res.status(404).json({success:false,error:"Deal not found"});
  }

  deal.status=req.body.status||deal.status;
  deal.updated=new Date().toISOString();

  save(deals);

  res.json({
    success:true,
    message:"Deal updated",
    deal
  });
});

module.exports=router;
