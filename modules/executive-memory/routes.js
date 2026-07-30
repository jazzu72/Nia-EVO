const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{

 let memory={
  system:"Nia Executive Memory",
  records:[]
 };

 try{
  memory=JSON.parse(
   fs.readFileSync(
    "./data/executive-memory-index.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(memory);

});

module.exports=router;
