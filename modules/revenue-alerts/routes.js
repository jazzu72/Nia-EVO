const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{

 let alerts={
  system:"Nia Revenue Alerts",
  alertCount:0,
  alerts:[]
 };

 try{
  alerts=JSON.parse(
   fs.readFileSync(
    "./reports/revenue-alerts.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(alerts);

});

module.exports=router;
