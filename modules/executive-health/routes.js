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

 const audit=read("./modules/audit-log/data/audit.json");
 const deals=read("./modules/deal-pipeline/data/deals.json");
 const actions=read("./modules/action-center/data/actions.json");

 res.json({
  system:"Nia Executive Health",
  status:"ONLINE",
  timestamp:new Date().toISOString(),
  health:{
   auditEvents:audit.length,
   activeDeals:deals.length,
   pendingActions:actions.filter(a=>a.status==="pending").length,
   services:"monitored"
  },
  latest:audit.slice(-5).reverse()
 });

});

module.exports=router;
