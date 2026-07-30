const express=require("express");
const router=express.Router();
const fs=require("fs");

function read(path){
 try{
  return JSON.parse(fs.readFileSync(path,"utf8"));
 }catch{
  return [];
 }
}

router.get("/",(req,res)=>{

 const deals=read("./modules/deal-pipeline/data/deals.json");
 const grants=read("./modules/grants/data/grants.json");
 const offers=read("./modules/offers/data/offers.json");

 const opportunities=[
  ...deals.map(d=>({
   type:"deal",
   target:d.address,
   value:Number(d.value||0),
   score:Number(d.value||0)/1000
  })),

  ...grants.map(g=>({
   type:"grant",
   target:g.name,
   value:Number(g.amount||0),
   score:Number(g.amount||0)/1000
  })),

  ...offers.map(o=>({
   type:"offer",
   target:o.address,
   value:Number(o.maxOffer||0),
   score:Number(o.maxOffer||0)/1000
  }))
 ];

 opportunities.sort((a,b)=>b.score-a.score);

 res.json({
  system:"Nia Opportunity Ranking Engine",
  count:opportunities.length,
  top:opportunities.slice(0,20)
 });

});

module.exports=router;
