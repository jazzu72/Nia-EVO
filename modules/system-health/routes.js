const express=require("express");
const router=express.Router();

router.get("/",(req,res)=>{

res.json({
 system:"Nia System Health",
 status:"ONLINE",
 timestamp:new Date().toISOString(),
 services:{
  core:"online",
  revenueEngine:"online",
  dealPipeline:"online",
  grantEngine:"online",
  actionQueue:"online",
  dashboard:"online"
 }
});

});

module.exports=router;
