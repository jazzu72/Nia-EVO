const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{

 let metrics={
  system:"Nia Executive Metrics",
  queue:{},
  auditEvents:0
 };

 try{
  metrics=JSON.parse(
   fs.readFileSync(
    "./data/executive-metrics.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(metrics);

});

module.exports=router;
