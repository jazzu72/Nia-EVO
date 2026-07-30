const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{

 let queue=[];

 try{
  queue=JSON.parse(
   fs.readFileSync(
    "./modules/ceo-queue/data/queue.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json({
  system:"Nia CEO Decision Queue",
  pending:queue.filter(q=>q.status==="pending").length,
  total:queue.length,
  queue:queue.slice(-20).reverse()
 });

});

module.exports=router;
