const express=require("express");
const fs=require("fs");
const router=express.Router();

router.get("/",(req,res)=>{
 let summary={};

 try{
  summary=JSON.parse(
   fs.readFileSync("./reports/revenue-command-summary.json","utf8")
  );
 }catch(e){
  summary={
   status:"UNAVAILABLE",
   error:e.message
  };
 }

 res.json({
  system:"Nia Revenue Command Center API",
  status:"ONLINE",
  timestamp:new Date().toISOString(),
  summary
 });
});

module.exports=router;
