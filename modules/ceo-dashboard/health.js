const express=require("express");
const router=express.Router();

router.get("/",(req,res)=>{
 res.json({
  system:"Nia CEO Dashboard Health",
  status:"ONLINE",
  timestamp:new Date().toISOString()
 });
});

module.exports=router;
