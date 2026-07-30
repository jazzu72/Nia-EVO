const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{

 let heartbeat={
  system:"Nia Dashboard Heartbeat",
  status:"OFFLINE"
 };

 try{
  heartbeat=JSON.parse(
   fs.readFileSync(
    "./data/dashboard-heartbeat.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(heartbeat);

});

module.exports=router;
