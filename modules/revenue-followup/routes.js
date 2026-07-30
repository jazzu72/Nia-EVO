const express=require("express");
const fs=require("fs");
const router=express.Router();

router.get("/",(req,res)=>{
 let queue={tasks:[]};

 try{
  queue=JSON.parse(
   fs.readFileSync("./data/revenue-execution-queue.json","utf8")
  );
 }catch(e){}

 res.json({
  system:"Nia Revenue Follow-Up Queue",
  status:"ONLINE",
  timestamp:new Date().toISOString(),
  pendingActions:queue.tasks.length,
  tasks:queue.tasks
 });
});

module.exports=router;
