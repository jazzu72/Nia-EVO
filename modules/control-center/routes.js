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

router.get("/overview",(req,res)=>{

 const audit=read("./modules/audit-log/data/audit.json");
 const actions=read("./modules/action-center/data/actions.json");
 const queue=read("./modules/action-queue/data/queue.json");
 const verification=read("./modules/audit-log/data/audit.json")
  .filter(e=>e.event==="startup_verification")
  .slice(-1);

 res.json({
  system:"Nia Control Center",
  status:"ONLINE",
  timestamp:new Date().toISOString(),
  metrics:{
   auditEvents:audit.length,
   activeActions:actions.filter(a=>a.status==="pending").length,
   queuedActions:queue.length
  },
  latestEvents:audit.slice(-10).reverse(),
  startupStatus:verification
 });

});

module.exports=router;
