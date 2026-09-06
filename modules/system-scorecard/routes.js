const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{

 let scorecard={
  system:"Nia Capital OS System Scorecard",
  score:0,
  grade:"UNKNOWN"
 };

 try{
  scorecard=JSON.parse(
   fs.readFileSync(
    "./reports/system-scorecard.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(scorecard);

});

module.exports=router;
