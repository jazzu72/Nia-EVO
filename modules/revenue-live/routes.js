const express=require("express");
const fs=require("fs");
const router=express.Router();

router.get("/",(req,res)=>{
 let data={};

 try{
  data=JSON.parse(
   fs.readFileSync("./reports/revenue-final-loop.json","utf8")
  );
 }catch(e){
  data={error:e.message};
 }

 res.json({
  system:"Nia Live Revenue Command",
  status:"ONLINE",
  timestamp:new Date().toISOString(),
  data
 });
});

module.exports=router;
