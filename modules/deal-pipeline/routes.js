const express=require("express");
const router=express.Router();
const fs=require("fs");

const DB="./modules/deal-pipeline/data/deals.json";

function read(){
 try{return JSON.parse(fs.readFileSync(DB,"utf8"));}catch{return [];}
}

function save(d){
 fs.writeFileSync(DB,JSON.stringify(d,null,2));
}

router.get("/",(req,res)=>{
 const deals=read();

 res.json({
  system:"Nia Deal Pipeline",
  count:deals.length,
  stages:{
   new:deals.filter(d=>d.stage==="new").length,
   contact:deals.filter(d=>d.stage==="contact").length,
   negotiation:deals.filter(d=>d.stage==="negotiation").length,
   closed:deals.filter(d=>d.stage==="closed").length
  },
  deals
 });
});

router.post("/create",(req,res)=>{
 const deals=read();

 const deal={
  id:Date.now(),
  address:req.body.address||"Unknown",
  value:Number(req.body.value||0),
  stage:"new",
  created:new Date().toISOString()
 };

 deals.push(deal);
 save(deals);

 res.json({success:true,deal});
});

module.exports=router;
