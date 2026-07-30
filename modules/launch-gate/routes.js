const express=require("express");
const router=express.Router();
const fs=require("fs");

function read(path){
 try{
  return JSON.parse(fs.readFileSync(path,"utf8"));
 }catch{
  return {};
 }
}

router.get("/",(req,res)=>{

 const health=read("./data/deployment-check.json");
 const snapshot=read("./data/intelligence-snapshot.json");
 const audit=read("./modules/audit-log/data/audit.json");

 const checks={
  deployment:!!health.checks,
  intelligence:!!snapshot.metrics,
  audit:Array.isArray(audit),
  timestamp:new Date().toISOString()
 };

 const ready=Object.values(checks)
  .filter(v=>typeof v==="boolean")
  .every(Boolean);

 res.json({
  system:"Nia Launch Gate",
  status:ready?"READY":"CHECK REQUIRED",
  checks,
  summary:{
   pipeline:snapshot.metrics?.pipelineValue||0,
   actions:snapshot.metrics?.pendingActions||0,
   events:audit.length||0
  }
 });

});

module.exports=router;
