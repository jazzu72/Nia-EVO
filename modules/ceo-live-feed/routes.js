const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{

 let feed={
  system:"Nia CEO Live Feed",
  status:"OFFLINE"
 };

 try{
  feed=JSON.parse(
   fs.readFileSync(
    "./reports/ceo-live-feed.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(feed);

});

module.exports=router;
