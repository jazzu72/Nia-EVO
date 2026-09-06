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

router.get("/snapshot",(req,res)=>{

 const deals=read("./modules/deal-pipeline/data/deals.json");
 const actions=read("./modules/action-center/data/actions.json");
 const grants=read("./modules/grants/data/grants.json");
 const offers=read("./modules/offers/data/offers.json");

 res.json({
  system:"Nia Executive Command Center",
  status:"ONLINE",
  timestamp:new Date().toISOString(),

  metrics:{
   offers:offers.length,
   deals:deals.length,
   pipelineValue:deals.reduce(
    (s,d)=>s+Number(d.value||0),0
   ),
   pendingActions:actions.filter(
    a=>a.status==="pending"
   ).length,
   grantOpportunities:grants.length,
   grantValue:grants.reduce(
    (s,g)=>s+Number(g.amount||0),0
   )
  },

  priorities:actions
   .filter(a=>a.priority==="HIGH")
   .slice(0,10)
 });
});

module.exports=router;
