const express=require("express");
const router=express.Router();
const fs=require("fs");

function read(file){
 try{
  return JSON.parse(fs.readFileSync(file,"utf8"));
 }catch{
  return [];
 }
}

router.post("/",(req,res)=>{
 const command=(req.body.command||"").toLowerCase();

 let response="Nia is online.";

 if(command.includes("status")){
   response="Nia Capital OS is operational.";
 }

 if(command.includes("deal") || command.includes("offer")){
   const offers=read("./modules/offers/data/offers.json");
   response=`Nia found ${offers.length} active offers in the acquisition engine.`;
 }

 if(command.includes("revenue") || command.includes("money")){
   const closings=read("./modules/closing-tracker/data/closings.json");
   const revenue=closings.reduce((a,c)=>a+Number(c.revenue||0),0);
   response=`Current tracked revenue: $${revenue.toLocaleString()}.`;
 }

 if(command.includes("grant")){
   response="Nia grant scanner is ready for opportunities.";
 }

 res.json({
  success:true,
  niaResponse:response,
  timestamp:new Date().toISOString()
 });
});

module.exports=router;
