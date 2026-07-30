const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{
 let actions=[];

 try{
  actions=JSON.parse(
   fs.readFileSync("./modules/action-center/data/actions.json","utf8")
  );
 }catch{}

 actions.sort((a,b)=>{
   const p={HIGH:3,normal:2,LOW:1};
   return (p[b.priority]||0)-(p[a.priority]||0);
 });

 res.json({
   system:"Nia Priority Engine",
   topActions:actions.slice(0,10),
   total:actions.length,
   timestamp:new Date().toISOString()
 });
});

module.exports=router;
