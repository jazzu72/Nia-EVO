const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{
 let brief={
  system:"Nia Revenue Command Brief",
  status:"OFFLINE"
 };

 try{
  brief=JSON.parse(
   fs.readFileSync(
    "./reports/revenue-command-brief.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(brief);
});

module.exports=router;
