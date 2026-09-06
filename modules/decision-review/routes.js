const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{

 let report={
  system:"Nia Decision Review",
  status:"NOT_READY"
 };

 try{
  report=JSON.parse(
   fs.readFileSync(
    "./reports/decision-review.json",
    "utf8"
   )
  );
 }catch(e){}

 res.json(report);

});

module.exports=router;
