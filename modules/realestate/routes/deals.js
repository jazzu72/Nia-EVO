const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB='./modules/realestate/data/deals.json';

function load(){
 try{
  return JSON.parse(fs.readFileSync(DB,'utf8'));
 }catch{
  return [];
 }
}

router.get('/',(req,res)=>{
 const deals=load().sort((a,b)=>b.id-a.id);
 res.json({
  system:"Nia Deal Registry",
  totalDeals:deals.length,
  deals
 });
});

router.get('/:id',(req,res)=>{
 const deal=load().find(d=>String(d.id)===String(req.params.id));
 if(!deal) return res.status(404).json({error:"Deal not found"});
 res.json(deal);
});

module.exports=router;
