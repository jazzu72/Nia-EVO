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
 const actions=read("./modules/action-center/data/actions.json");
 const grants=read("./modules/grants/data/grants.json");
 const offers=read("./modules/offers/data/offers.json");

 const pipeline=deals.reduce(
  (s,d)=>s+Number(d.value||0),0
 );

 const funding=grants.reduce(
  (s,g)=>s+Number(g.amount||0),0
 );

 res.json({
  system:"Nia CEO Brief",
  date:new Date().toISOString(),

  summary:{
   activeDeals:deals.length,
   offers:offers.length,
   pipelineValue:pipeline,
   grantPipeline:funding,
   pendingActions:actions.filter(
    a=>a.status==="pending"
   ).length
  },

  nextActions:actions
   .filter(a=>a.priority==="HIGH")
   .slice(0,5)
 });

});

module.exports=router;
