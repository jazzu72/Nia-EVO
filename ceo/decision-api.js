const express=require("express");
const router=express.Router();
const orchestrator=require("../grants-engine/funding-orchestrator");
const submission=require("../grants-engine/submission-engine");
const actionQueue=require("./action-queue-engine");

router.get("/decision",(req,res)=>{
 const fundingDecision=orchestrator.orchestrate();

 const submissionPackage=submission.createSubmission({
  name:"Virginia Innovation Partnership Corporation",
  amount:250000
 });

 const action=actionQueue.createAction({
  title:"Complete Virginia Innovation Partnership Corporation submission",
  priority:"CRITICAL",
  category:"GRANT_FUNDING"
 });

 res.json({
  system:"NIA CEO CAPITAL ALLOCATION ENGINE",
  status:"ONLINE",
  fundingDecision,
  submissionPackage,
  actionQueue:action,
  generated:new Date().toISOString()
 });
});

module.exports=router;
