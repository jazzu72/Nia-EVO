const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/snapshot",(req,res)=>{

 let snapshot={};

 try{
  snapshot=JSON.parse(
   fs.readFileSync(
    "./data/intelligence-snapshot.json",
    "utf8"
   )
  );
 }catch{
  snapshot={
   status:"INITIALIZING",
   metrics:{}
  };
 }

 res.json(snapshot);

});

module.exports=router;
