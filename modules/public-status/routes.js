const express=require("express");
const router=express.Router();

const fs=require("fs");

function read(path){
 try{
  return JSON.parse(fs.readFileSync(path,"utf8"));
 }catch{
  return [];
 }
}

router.get("/",(req,res)=>{
 const deals=read("./modules/deal-pipeline/data/deals.json");
 const offers=read("./modules/offers/data/offers.json");

 res.json({
  system:"Nia Capital OS",
  status:"ONLINE",
  metrics:{
   opportunities:offers.length,
   activePipeline:deals.length,
   pipelineValue:deals.reduce(
    (sum,d)=>sum+Number(d.value||0),0
   )
  },
  timestamp:new Date().toISOString()
 });
});

module.exports=router;
