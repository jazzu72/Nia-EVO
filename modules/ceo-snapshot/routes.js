const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{

 let snapshot={
  system:"Nia CEO Command Snapshot",
  status:"OFFLINE"
 };

 try{
  snapshot=JSON.parse(
   fs.readFileSync(
    "./data/ceo-command-snapshot.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(snapshot);

});

module.exports=router;
