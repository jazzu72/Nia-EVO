const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{

 let alerts={
  system:"Nia Executive Alert Engine",
  alertCount:0,
  alerts:[]
 };

 try{
  alerts=JSON.parse(
   fs.readFileSync(
    "./reports/executive-alerts.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(alerts);

});

module.exports=router;
