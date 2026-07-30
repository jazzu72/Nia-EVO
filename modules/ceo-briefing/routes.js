const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{

 let report={
  system:"Nia CEO Daily Briefing",
  status:"INITIALIZING"
 };

 try{
  report=JSON.parse(
   fs.readFileSync(
    "./reports/ceo-daily-briefing.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(report);

});

module.exports=router;
