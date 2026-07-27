const express=require("express");
const router=express.Router();

const engine=require("./grant-acquisition-engine");

router.get("/scan",(req,res)=>{
 res.json({
  system:"NIA GRANT ACQUISITION ENGINE",
  grants:engine.scan()
 });
});

router.post("/prepare",(req,res)=>{
 res.json({
  status:"APPLICATIONS_CREATED",
  applications:engine.createApplications()
 });
});

module.exports=router;
