const express=require("express");
const router=express.Router();
const fs=require("fs");

function read(path){
 try{return JSON.parse(fs.readFileSync(path,"utf8"));}catch{return [];}
}

router.get("/investor-summary",(req,res)=>{
 const deals=read("./modules/deal-pipeline/data/deals.json");
 const actions=read("./modules/action-center/data/actions.json");
 const offers=read("./modules/offers/data/offers.json");

 res.json({
  company:"House of Jazzu",
  system:"Nia Capital OS",
  status:"Operational",
  generated:new Date().toISOString(),
  metrics:{
   opportunities:offers.length,
   activeDeals:deals.length,
   pipelineValue:deals.reduce((s,d)=>s+Number(d.value||0),0),
   pendingActions:actions.filter(a=>a.status==="pending").length
  },
  highlights:[
   "AI opportunity discovery active",
   "Revenue pipeline monitoring active",
   "Executive command center active"
  ]
 });
});

module.exports=router;
