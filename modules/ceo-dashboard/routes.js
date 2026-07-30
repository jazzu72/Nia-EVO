const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{

 let dashboard={
  system:"Nia CEO Command Dashboard",
  status:"OFFLINE"
 };

 try{
  dashboard=JSON.parse(
   fs.readFileSync(
    "./reports/ceo-command-dashboard.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(dashboard);

});

module.exports=router;
