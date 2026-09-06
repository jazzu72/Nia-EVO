const express=require("express");
const router=express.Router();

const engine=require("./funding-decision-engine");

router.get("/decision",(req,res)=>{
 res.json(engine.fundingDecision());
});

module.exports=router;
