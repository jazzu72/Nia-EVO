const express=require("express");
const fs=require("fs");
const router=express.Router();

router.get("/",(req,res)=>{
 let brief={};

 try{
  brief=JSON.parse(
   fs.readFileSync("./reports/revenue-executive-brief.json","utf8")
  );
 }catch(e){
  brief={
   status:"NO_BRIEF_AVAILABLE",
   error:e.message
  };
 }

 res.json({
  system:"Nia Revenue Command API",
  timestamp:new Date().toISOString(),
  brief
 });
});

module.exports=router;
