const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{
 let dashboard={
  system:"Nia Revenue Operating Dashboard",
  status:"OFFLINE"
 };

 try{
  dashboard=JSON.parse(
   fs.readFileSync(
    "./reports/revenue-operating-dashboard.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(dashboard);
});

module.exports=router;
