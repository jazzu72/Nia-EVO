const express=require("express");
const router=express.Router();
const fs=require("fs");

const files=[
 "./modules/action-center/data/actions.json",
 "./modules/offers/data/offers.json",
 "./modules/lead-scanner/data/sources.json"
];

router.get("/",(req,res)=>{
 let activity=[];

 files.forEach(file=>{
  try{
   const data=JSON.parse(fs.readFileSync(file,"utf8"));
   data.slice(-10).forEach(item=>{
    activity.push({
     source:file.split("/")[2],
     time:item.created||new Date().toISOString(),
     message:`${file.split("/")[2]} updated ${item.address||item.target||"record"}`
    });
   });
  }catch{}
 });

 activity.sort((a,b)=>new Date(b.time)-new Date(a.time));

 res.json({
  system:"Nia Activity Feed",
  count:activity.length,
  activity:activity.slice(0,20)
 });
});

module.exports=router;
