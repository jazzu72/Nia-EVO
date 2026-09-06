const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{
 let deals=[];

 try{
  deals=JSON.parse(
   fs.readFileSync("./modules/deal-pipeline/data/deals.json","utf8")
  );
 }catch{}

 const pipelineValue=deals.reduce(
   (sum,d)=>sum+Number(d.value||0),0
 );

 const active=deals.filter(
   d=>d.stage!=="closed"
 ).length;

 res.json({
  system:"Nia Pipeline Intelligence",
  activeDeals:active,
  pipelineValue,
  projectedRevenue:pipelineValue,
  timestamp:new Date().toISOString()
 });
});

module.exports=router;
