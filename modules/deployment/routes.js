const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/status",(req,res)=>{

 let report={
  system:"Nia Deployment Readiness",
  status:"initializing"
 };

 try{
  report=JSON.parse(
   fs.readFileSync(
    "./data/deployment-check.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(report);

});

module.exports=router;
