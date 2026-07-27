const express=require("express");
const router=express.Router();

const submission=require("../grants-engine/grant-submission-engine");
const bridge=require("../grants-engine/grant-execution-bridge");

router.get("/grant-status",(req,res)=>{

 const submissions=submission.dashboard();

 res.json({
  system:"NIA GRANT AUTOPILOT",
  status:"ONLINE",
  activeGrant:{
   name:"Virginia Innovation Partnership Corporation",
   amount:250000,
   priority:"CRITICAL"
  },
  submissions,
  execution:bridge.executeFundingDecision(),
  generated:new Date().toISOString()
 });

});

router.post("/grant-create",(req,res)=>{

 const app=submission.createSubmission({
  name:"Virginia Innovation Partnership Corporation",
  amount:250000
 });

 res.json({
  status:"APPLICATION_CREATED",
  application:app
 });

});

module.exports=router;
